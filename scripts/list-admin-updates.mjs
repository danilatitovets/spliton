import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
const rows = await p.adminUpdateAnnouncement.findMany({ orderBy: { updatedAt: "desc" }, select: { id: true, title: true, status: true, type: true, audienceRoles: true, publishedAt: true } });
console.log(JSON.stringify(rows, null, 2));
const reads = await p.adminUpdateRead.findMany({ select: { announcementId: true, adminUserId: true, dismissedAt: true, readAt: true } });
console.log("reads", JSON.stringify(reads, null, 2));
await p.$disconnect();
