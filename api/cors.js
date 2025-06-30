export default async function handler(req, res) {
  const { url, method, headers } = req;
  // Get all query params after ?target=
  const urlParams = new URL('http://dummy?' + (url.split('?')[1] || ''));
  const target = urlParams.get('target');
  if (!target) {
    res.status(400).json({ error: "Missing target query param" });
    return;
  }
  // Forward the request to the target, including any other query params
  let restOfQuery = '';
  const parts = url.split('?');
  if (parts.length > 1) {
    // remove "target=" from the full query string to preserve other params
    const queries = parts[1].split('&').filter(q => !q.startsWith('target='));
    if (queries.length) {
      restOfQuery = '&' + queries.join('&');
    }
  }
  let body = undefined;
  if (method !== "GET" && method !== "HEAD") {
    body = await new Promise(resolve => {
      let data = '';
      req.on('data', chunk => data += chunk);
      req.on('end', () => resolve(data));
    });
  }
  const response = await fetch(target + restOfQuery, {
    method,
    headers: { 'Content-Type': headers['content-type'] || 'application/json' },
    body,
  });
  const text = await response.text();
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.status(response.status).send(text);
}
