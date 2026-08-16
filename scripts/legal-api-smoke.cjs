const base = process.argv[2] ?? 'http://localhost:4001';
const REQUIRED = ['TERMS_OF_SERVICE','PRIVACY_POLICY','RISK_DISCLOSURE','INVESTOR_AGREEMENT','FEE_POLICY','SECONDARY_MARKET_RULES','WITHDRAWAL_POLICY','AML_POLICY'];
async function get(path) {
  const res = await fetch(base + path);
  const body = await res.json().catch(() => null);
  return { status: res.status, body };
}
(async () => {
  console.log('Base:', base);
  const active = await get('/api/v1/legal/policies/active');
  console.log('active', active.status, 'count', active.body?.length);
  const types = new Set((active.body || []).map(p => p.type));
  console.log('required present', REQUIRED.filter(t => types.has(t)).length, '/', REQUIRED.length);
  for (const type of ['TERMS_OF_SERVICE','PRIVACY_POLICY','RISK_DISCLOSURE','AML_POLICY']) {
    const r = await get('/api/v1/legal/policies/' + type + '/active');
    const p = r.body;
    console.log(type, r.status, p?.version, 'len', p?.content?.length, 'hash', Boolean(p?.contentHash));
  }
})();