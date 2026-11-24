// iwroteit — server side. Keeps API keys off the browser.
// Add ONE of these in Vercel → Project → Settings → Environment Variables:
//   GEMINI_API_KEY     free — from aistudio.google.com (recommended free option)
//   GROQ_API_KEY       free — from console.groq.com (backup free option)
//   ANTHROPIC_API_KEY  paid — Claude, best quality
// Optional:
//   APP_PASSWORD       locks the site so only you can use your key
//   MODEL              override the model for whichever provider is used

const PROVIDER = process.env.GEMINI_API_KEY ? 'gemini' : process.env.GROQ_API_KEY ? 'groq' : process.env.ANTHROPIC_API_KEY ? 'claude' : null;
const MODEL = process.env.MODEL || { gemini: 'gemini-3.8-flash', groq: 'openai/gpt-oss-120b', claude: 'claude-sonnet-5-5' }[PROVIDER];
const MAX_TEXT = 15000;

function profileText(p = {}) {
  const lines = [];
  const add = (label, v) => { if (v && (!Array.isArray(v) || v.length)) lines.push(`- ${label}: ${Array.isArray(v) ? v.join(', ') : v}`); };
  add('Usually writes', p.kinds);
  add('Level', p.level);
  add('English', p.english);
  add('Sentence style', p.sentences);
  add('Contractions', p.contractions);
  add('Vocabulary', p.vocab);
  add('Spelling', p.spelling);
  add('Punctuation they actually use', p.punct);
  add('Punctuation they never use', p.nopunct);
  add('Uses "I" in formal writing', p.firstPerson);
  add('How polished', p.polish);
  add('Words and phrases they use a lot', p.favs);
  add('Words they would never use', p.bans);
  add('Anything else about how they write', p.notes);
  return lines.join('\n') || '- (no answers yet)';
}

function samplesText(p = {}) {
  const s = (p.samples || '').trim().slice(0, 8000);
  return s ? `<writing_samples>\n${s}\n</writing_samples>` : '<writing_samples>(none given)</writing_samples>';
}

const RULES = `You rewrite text so it reads exactly like the person described below wrote it themselves.
Match their voice from the samples first, then the profile: their sentence length and rhythm, word choice, how they open and link sentences, their level of formality, and their spelling convention.
Keep every fact, figure, name, citation and the meaning of the original. Do not add new facts or sources.
Fold in the person's own answers (opinions, examples, experiences) where they fit naturally, in their voice.
Avoid stock phrasing that this person would not use, for example: "delve", "tapestry", "in today's fast-paced world", "it is important to note", "moreover", "furthermore", "in conclusion", "plays a crucial role", "navigate the complexities", "a testament to". Never use a word on their never-use list. Only use punctuation they say they use.
Vary sentence length the way their samples do. Don't make every paragraph the same shape. Don't open with a summary of what you're about to say.`;

async function callAI(system, user, maxTokens = 4000) {
  let url, headers = { 'content-type': 'application/json' }, body;
  if (PROVIDER === 'gemini') {
    url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(MODEL)}:generateContent`;
    headers['x-goog-api-key'] = process.env.GEMINI_API_KEY;
    body = { systemInstruction: { parts: [{ text: system }] }, contents: [{ role: 'user', parts: [{ text: user }] }], generationConfig: { maxOutputTokens: maxTokens + 4000, temperature: 0.9 } };
  } else if (PROVIDER === 'groq') {
    url = 'https://api.groq.com/openai/v1/chat/completions';
    headers.authorization = `Bearer ${process.env.GROQ_API_KEY}`;
    body = { model: MODEL, max_tokens: maxTokens + 2000, temperature: 0.8, messages: [{ role: 'system', content: system }, { role: 'user', content: user }] };
  } else {
    url = 'https://api.anthropic.com/v1/messages';
    headers['x-api-key'] = process.env.ANTHROPIC_API_KEY; headers['anthropic-version'] = '2023-06-01';
    body = { model: MODEL, max_tokens: maxTokens, system, messages: [{ role: 'user', content: user }] };
  }
  const r = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    if (r.status === 429) { const e = new Error('The free AI limit was hit for now. Wait a minute and try again.'); e.status = 429; throw e; }
    const e = new Error(data?.error?.message || `AI error ${r.status}`); e.status = r.status; throw e;
  }
  let text;
  if (PROVIDER === 'gemini') text = (data.candidates?.[0]?.content?.parts || []).filter(p => !p.thought).map(p => p.text || '').join('');
  else if (PROVIDER === 'groq') text = data.choices?.[0]?.message?.content || '';
  else text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
  text = text.trim();
  if (!text) throw new Error('The AI sent back an empty answer. Try again.');
  return text;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST' });
  if (!PROVIDER) return res.status(503).json({ error: 'No AI key yet. Add GEMINI_API_KEY (free) in Vercel, then redeploy.' });
  if (process.env.APP_PASSWORD && req.headers['x-app-password'] !== process.env.APP_PASSWORD) {
    return res.status(401).json({ error: 'password' });
  }

  const b = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const text = String(b.text || '').trim();
  if (!text) return res.status(400).json({ error: 'Paste some text first.' });
  if (text.length > MAX_TEXT) return res.status(400).json({ error: `That's a bit long. Keep it under ${MAX_TEXT.toLocaleString()} characters, or do it in parts.` });

  const profile = b.profile || {};
  const kind = String(b.kind || 'writing').slice(0, 60);
  const who = `<profile>\n${profileText(profile)}\n</profile>\n${samplesText(profile)}`;

  try {
    if (b.mode === 'questions') {
      const out = await callAI(
        'You help a person make a piece of writing genuinely theirs. You ask short, friendly questions that pull out their own opinions, examples and experiences, so the rewrite can include them. Reply with JSON only.',
        `${who}\n\nThis is a ${kind}. Here is the draft:\n<draft>\n${text}\n</draft>\n\nAsk 3 short questions (under 20 words each) whose answers would let the rewrite sound personal and specific to this person: their own view on the main point, a real example or experience they could mention, and anything they'd want to stress or cut. Plain casual wording. Return exactly: {"questions":["...","...","..."]}`,
        600
      );
      const m = out.match(/\{[\s\S]*\}/);
      let qs = [];
      try { qs = JSON.parse(m ? m[0] : out).questions || []; } catch { qs = []; }
      return res.status(200).json({ questions: qs.slice(0, 4).map(q => String(q).slice(0, 200)) });
    }

    const answers = Array.isArray(b.answers) ? b.answers.filter(a => a && a.a && String(a.a).trim()) : [];
    const ans = answers.length
      ? `<their_answers>\n${answers.map(a => `Q: ${String(a.q).slice(0, 200)}\nA: ${String(a.a).slice(0, 1500)}`).join('\n\n')}\n</their_answers>`
      : '';
    const length = { same: 'Keep roughly the same length.', shorter: 'Make it about 25% shorter.', longer: 'Make it about 25% longer, using their answers rather than padding.' }[b.length] || 'Keep roughly the same length.';
    const tweak = b.tweak ? `\nAdjustment requested on the last version: ${String(b.tweak).slice(0, 300)}` : '';
    const lockNote = b.locked
      ? '\nThe draft contains locked markers like ⟦1⟧, ⟦2⟧. Each one stands for a citation, date or note the person wrote in brackets. Copy every marker exactly, once each, and keep it attached to the same claim or sentence it belongs to. Never remove, merge, renumber or invent markers.'
      : '';
    const base = b.previous ? `\n<last_version>\n${String(b.previous).slice(0, MAX_TEXT)}\n</last_version>` : '';

    const out = await callAI(
      `${RULES}\n\n${who}`,
      `This is a ${kind}. ${length}${tweak}${lockNote}\n<original>\n${text}\n</original>${base}\n${ans}\n\nReturn only the rewritten text, no title or notes.`
    );
    return res.status(200).json({ text: out });
  } catch (e) {
    const bad = [400, 401, 403].includes(e.status) && /key|auth|permission/i.test(e.message);
    return res.status(e.status === 429 ? 429 : 500).json({ error: bad ? 'The API key in Vercel was rejected. Check it and redeploy.' : e.message });
  }
}
