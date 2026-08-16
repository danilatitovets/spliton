require('dotenv').config();
const base = 'http://localhost:4001';
const email = 'staging.qa.compliance@spliton.test';
const password = process.env.STAGING_QA_PASSWORD || 'StagingQa2026!';

async function req(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = 'Bearer ' + token;
  const res = await fetch(base + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
}

(async () => {
  const noAuth = await req('GET', '/api/admin/v1/legal/policies/grouped');
  console.log('admin grouped no auth', noAuth.status);

  const login = await req('POST', '/auth/login', { email, password });
  console.log('compliance login', login.status, login.json?.user?.email);
  const token = login.json.accessToken || login.json.tokens?.accessToken;
  if (!token) process.exit(1);

  const grouped = await req('GET', '/api/admin/v1/legal/policies/grouped', null, token);
  console.log('admin grouped', grouped.status, 'types', grouped.json?.length ?? 'n/a');

  const { PrismaClient, LegalPolicyStatus } = require('@prisma/client');
  const p = new PrismaClient();
  const orphans = await p.legalPolicy.findMany({
    where: { status: LegalPolicyStatus.DRAFT, version: '2026.06.1' },
    include: { _count: { select: { consents: true } } },
  });
  let archived = 0;
  for (const row of orphans) {
    if (row._count.consents > 0) { console.log('SKIP', row.type, 'has consents'); continue; }
    const r = await req('POST', '/api/admin/v1/legal/policies/' + row.id + '/archive', {}, token);
    console.log('archive', row.type, r.status, r.json?.status);
    if (r.status === 200 || r.status === 201) archived++;
  }
  console.log('archived', archived, '/', orphans.length);
  const counts = await p.legalPolicy.groupBy({ by: ['status'], _count: { _all: true } });
  console.log('status counts', Object.fromEntries(counts.map(c => [c.status, c._count._all])));
  await p.$disconnect();
})();