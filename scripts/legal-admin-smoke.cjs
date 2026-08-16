require('dotenv').config();
const base = 'http://localhost:4001';
async function req(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = 'Bearer ' + token;
  const res = await fetch(base + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  return { status: res.status, json: await res.json().catch(() => ({})) };
}
(async () => {
  const login = await req('POST', '/auth/login', { email: 'staging.qa.compliance@spliton.test', password: process.env.STAGING_QA_PASSWORD || 'StagingQa2026!' });
  const token = login.json.accessToken;
  const draft = await req('POST', '/api/admin/v1/legal/policies', {
    type: 'COOKIE_POLICY', version: '2026.06.smoke-draft', title: 'Smoke draft', content: '# Smoke\n\nTemporary draft for admin CMS smoke test only. Not for publish.',
    contentFormat: 'MARKDOWN', requiresUserConsent: false,
  }, token);
  console.log('create draft', draft.status, draft.json?.status, draft.json?.id?.slice(0,8));
  if (draft.json?.id) {
    const review = await req('POST', '/api/admin/v1/legal/policies/' + draft.json.id + '/submit-review', {}, token);
    console.log('submit review', review.status, review.json?.status);
    const archive = await req('POST', '/api/admin/v1/legal/policies/' + draft.json.id + '/archive', {}, token);
    console.log('archive smoke draft', archive.status, archive.json?.status);
  }
})();