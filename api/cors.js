export default async function handler(req, res) {
  const { method, query } = req;
  const target = query.target;
  if (!target) {
    res.status(400).json({ error: "Missing target query param" });
    return;
  }

  let fetchUrl = target;
  // Forward other query params
  const queryParams = { ...query };
  delete queryParams.target;
  const qp = new URLSearchParams(queryParams).toString();
  if (qp) fetchUrl += (fetchUrl.includes('?') ? '&' : '?') + qp;

  let body = undefined;
  if (method !== "GET" && method !== "HEAD") {
    body = req.body;
  }

  try {
    const response = await fetch(fetchUrl, {
      method,
      headers: { 'content-type': req.headers['content-type'] || 'application/json' },
      body,
    });
    const text = await response.text();
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.status(response.status).send(text);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
