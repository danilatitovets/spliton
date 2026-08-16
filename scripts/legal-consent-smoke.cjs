require('dotenv').config();
const base = 'http://localhost:4001';
const email = process.env.STAGING_QA_INVESTOR || 'staging.qa.investor@spliton.test';
const password = process.env.STAGING_QA_PASSWORD || 'StagingQa2026!';

async function req(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = 'Bearer ' + token;
  const res = await fetch(base + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const text = await res.text();
  let json; try { json = JSON.parse(text); } catch { json = text; }
  return { status: res.status, json };
}

(async () => {
  const login = await req('POST', '/auth/login', { email, password });
  console.log('login', login.status, login.json?.user?.email || login.json?.message || typeof login.json);
  if (login.status !== 200 && login.status !== 201) process.exit(1);
  const token = login.json.accessToken || login.json.tokens?.accessToken;
  if (!token) { console.log('no token keys', Object.keys(login.json)); process.exit(1); }

  for (const path of ['/api/v1/compliance/eligibility/primary','/api/v1/compliance/eligibility/secondary','/api/v1/compliance/eligibility/withdrawal']) {
    const r = await req('GET', path, null, token);
    console.log(path, r.status, 'allowed=', r.json?.allowed, 'code=', r.json?.blockingCode);
  }

  const center = await req('GET', '/api/v1/legal/center', null, token);
  console.log('legal center', center.status, 'missing primary', center.json?.missingConsents?.primaryPurchase?.length);
})();