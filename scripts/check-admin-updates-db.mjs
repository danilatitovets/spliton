import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const rows = await prisma.$queryRaw`
  SELECT migration_name, finished_at, rolled_back_at
  FROM _prisma_migrations
  WHERE migration_name = '20260627140000_admin_update_announcements'
  ORDER BY finished_at DESC NULLS LAST
`;
console.log("migrations:", JSON.stringify(rows, null, 2));
console.log("announcements:", await prisma.adminUpdateAnnouncement.count());
console.log("reads:", await prisma.adminUpdateRead.count());
await prisma.$disconnect();
