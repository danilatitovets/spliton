require('dotenv').config();
const { PrismaClient, LegalPolicyStatus } = require('@prisma/client');

const REQUIRED_TYPES = [
  'TERMS_OF_SERVICE','PRIVACY_POLICY','RISK_DISCLOSURE','INVESTOR_AGREEMENT',
  'FEE_POLICY','SECONDARY_MARKET_RULES','WITHDRAWAL_POLICY','AML_POLICY',
];

async function main() {
  const prisma = new PrismaClient();
  try {
    const total = await prisma.legalPolicy.count();
    const byStatus = await prisma.legalPolicy.groupBy({ by: ['status'], _count: { _all: true } });
    const nullHashPolicies = await prisma.legalPolicy.count({ where: { contentHash: null } });
    const totalConsents = await prisma.userLegalConsent.count();
    const nullHashConsents = await prisma.userLegalConsent.count({ where: { acceptedContentHash: null } });
    const statusMap = Object.fromEntries(byStatus.map((r) => [r.status, r._count._all]));
    console.log('=== COUNTS ===');
    console.log(JSON.stringify({ totalPolicies: total, active: statusMap.ACTIVE ?? 0, draft: statusMap.DRAFT ?? 0, review: statusMap.REVIEW ?? 0, archived: statusMap.ARCHIVED ?? 0, nullContentHash: nullHashPolicies, totalConsents, nullAcceptedContentHash: nullHashConsents }, null, 2));
    const activeRows = await prisma.legalPolicy.findMany({ where: { status: LegalPolicyStatus.ACTIVE }, orderBy: [{ type: 'asc' }, { publishedAt: 'desc' }] });
    const activeByType = new Map();
    for (const row of activeRows) { if (!activeByType.has(row.type)) activeByType.set(row.type, row); }
    console.log('\n=== ACTIVE BY TYPE ===');
    console.log(JSON.stringify([...activeByType.values()].map((r) => ({ type: r.type, version: r.version, title: r.title, status: r.status, requiresUserConsent: r.requiresUserConsent, contentLength: r.content?.length ?? 0, contentHashExists: Boolean(r.contentHash), publishedAt: r.publishedAt?.toISOString() ?? null, contentFormat: r.contentFormat })), null, 2));
    console.log('\n=== REQUIRED MISSING ACTIVE ===');
    console.log(JSON.stringify(REQUIRED_TYPES.filter((t) => !activeByType.has(t)), null, 2));
    console.log('\n=== REQUIRED EMPTY CONTENT ===');
    console.log(JSON.stringify(REQUIRED_TYPES.filter((t) => { const row = activeByType.get(t); return row && (!row.content || row.content.trim().length === 0); }), null, 2));
    const allTypes = await prisma.legalPolicy.groupBy({ by: ['type'], _count: { _all: true } });
    console.log('\n=== VERSION COUNT BY TYPE ===');
    console.log(JSON.stringify(allTypes, null, 2));
  } finally { await prisma.$disconnect(); }
}
main().catch((e) => { console.error('AUDIT_ERROR:', e.message); process.exit(1); });