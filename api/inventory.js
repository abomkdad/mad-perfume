const TARGET = 'https://script.google.com/macros/s/AKfycbyctz_KmDwfvjk3aGM5gwRbCX-msE8K8TCHHgfMRhlyoW0yQyCn0qVzvN87Bbg8WZ3BcA/exec';

function callbackName(value) {
  const name = Array.isArray(value) ? value[0] : value;
  return typeof name === 'string' && /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*$/.test(name)
    ? name
    : null;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  try {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(req.query || {})) {
      if (key === 'callback' || value == null) continue;
      params.set(key, String(Array.isArray(value) ? value[0] : value));
    }

    const response = await fetch(TARGET + '?' + params.toString(), { redirect: 'follow' });
    const raw = await response.text();
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      throw new Error('Invalid response from dealer service');
    }

    if (!response.ok) return res.status(response.status).json(data);

    const cb = callbackName(req.query && req.query.callback);
    if (cb) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).send(cb + '(' + JSON.stringify(data) + ');');
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    return res.status(502).json({ ok: false, error: 'Dealer service unavailable' });
  }
}
