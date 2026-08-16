require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const base = 'http://localhost:4001';
const email = 'staging.qa.investor@spliton.test';
const password = process.env.STAGING_QA_PASSWORD || 'StagingQa2026!';

async function req(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = 'Bearer ' + token;
  const res = await fetch(base + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
}

(async () => {
  const login = await req('POST', '/auth/login', { email, password });
  const token = login.json.accessToken || login.json.tokens?.accessToken;
  const center1 = await req('GET', '/api/v1/legal/center', null, token);
  const missing = center1.json?.missingConsents?.primaryPurchase || [];
  console.log('before accept: missing primary', missing.length);
  const ids = missing.map(m => m.policyId).filter(Boolean);
  if (!ids.length) { console.log('nothing to accept'); return; }
  const accept = await req('POST', '/api/v1/legal/consents', { policyIds: ids, source: 'PRIMARY_PURCHASE' }, token);
  console.log('accept status', accept.status);
  const center2 = await req('GET', '/api/v1/legal/center', null, token);
  console.log('after accept: missing primary', center2.json?.missingConsents?.primaryPurchase?.length);
  const pri = await req('GET', '/api/v1/compliance/eligibility/primary', null, token);
  console.log('primary allowed', pri.json?.allowed, pri.json?.blockingCode);

  const prisma = new PrismaClient();
  const consents = await prisma.userLegalConsent.findMany({ where: { userId: login.json.user?.id }, orderBy: { acceptedAt: 'desc' }, take: 5 });
  console.log('consents in DB', consents.length, 'hasHash', consents.every(c => c.acceptedContentHash));
  if (consents[0]) console.log('sample', consents[0].policyType, consents[0].policyVersion, consents[0].acceptedContentHash?.slice(0,12));
  await prisma.$disconnect();
})();