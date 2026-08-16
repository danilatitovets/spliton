require('dotenv').config();
const { PrismaClient, LegalPolicyStatus } = require('@prisma/client');
(async () => {
  const p = new PrismaClient();
  const orphans = await p.legalPolicy.findMany({
    where: { status: LegalPolicyStatus.DRAFT, version: '2026.06.1' },
    include: { _count: { select: { consents: true } } },
    orderBy: { type: 'asc' },
  });
  console.log('orphans', orphans.length);
  for (const o of orphans) console.log(o.type, o.id.slice(0,8), 'consents', o._count.consents);
  const qa = await p.user.findMany({ where: { email: { contains: 'spliton.test' } }, select: { id: true, email: true }, take: 5 });
  console.log('qa users', qa.map(u => u.email).join(', ') || 'none');
  await p.$disconnect();
})();