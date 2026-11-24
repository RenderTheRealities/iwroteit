// iwroteit — server side. Keeps the Anthropic API key off the browser.
// Env vars (set in Vercel → Project → Settings → Environment Variables):
//   ANTHROPIC_API_KEY  required
//   APP_PASSWORD       optional — if set, the site asks for it before using your key
//   MODEL              optional — defaults to claude-sonnet-5-5

const MODEL = process.env.MODEL || 'claude-sonnet-5-5';
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

async function callClaude(system, user, maxTokens = 4000) {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({ model: MODEL, max_tokens: maxTokens, system, messages: [{ role: 'user', content: user }] })
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    const msg = data?.error?.message || `Anthropic API error ${r.status}`;
    const e = new Error(msg); e.status = r.status; throw e;
  }
  return (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('').trim();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST' });
  if (!process.env.ANTHROPIC_API_KEY) return res.status(503).json({ error: 'The site owner hasn\'t added an ANTHROPIC_API_KEY in Vercel yet.' });
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
      const out = await callClaude(
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

    const out = await callClaude(
      `${RULES}\n\n${who}`,
      `This is a ${kind}. ${length}${tweak}${lockNote}\n<original>\n${text}\n</original>${base}\n${ans}\n\nReturn only the rewritten text, no title or notes.`
    );
    return res.status(200).json({ text: out });
  } catch (e) {
    return res.status(e.status === 401 ? 502 : 500).json({ error: e.status === 401 ? 'The API key in Vercel was rejected. Check ANTHROPIC_API_KEY.' : e.message });
  }
}
