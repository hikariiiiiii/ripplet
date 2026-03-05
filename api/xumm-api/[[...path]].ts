const XUMM_API_BASE = 'https://xumm.app/api/v1/platform';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key, x-api-secret');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const apiKey = process.env.VITE_XUMM_API_KEY || req.headers['x-api-key'];
  const apiSecret = process.env.VITE_XUMM_API_SECRET || req.headers['x-api-secret'];

  if (!apiKey || !apiSecret) {
    return res.status(401).json({ error: 'Xumm API credentials not configured' });
  }

  const url = new URL(req.url, `https://${req.headers.host}`);
  let path = url.pathname.replace(/^\/api\/xumm-api\/?/, '').replace(/^\/xumm-api\/?/, '');
  
  if (!path) {
    path = Array.isArray(req.query.path) ? req.query.path.join('/') : req.query.path || '';
  }
  
  const targetUrl = path ? `${XUMM_API_BASE}/${path}` : XUMM_API_BASE;
  console.log('Proxying to:', targetUrl);

  try {
    const fetchOptions: RequestInit = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'x-api-secret': apiSecret,
      },
    };

    if (req.method === 'POST' || req.method === 'PUT') {
      fetchOptions.body = JSON.stringify(req.body);
    }

    const response = await fetch(targetUrl, fetchOptions);
    const data = await response.text();

    res.status(response.status);
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  } catch (error) {
    console.error('Xumm API proxy error:', error);
    res.status(500).json({ error: 'Failed to proxy request to Xumm API' });
  }
}
