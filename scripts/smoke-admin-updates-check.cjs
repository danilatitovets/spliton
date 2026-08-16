require("dotenv/config");
const { readFileSync } = require("node:fs");
const { PrismaClient } = require("@prisma/client");
const LEGAL = "Обновлён раздел юридических документов";
const BASE = process.env.API_BASE ?? "http://localhost:4001";
async function main() {
  const p = new PrismaClient();
  try {
    const mig = await p.$queryRawUnsafe("SELECT migration_name, finished_at, rolled_back_at FROM _prisma_migrations WHERE migration_name = '20260627140000_admin_update_announcements'");
    console.log("migration:", mig);
    const lines = readFileSync("spliton_pass.txt", "utf8").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const email = lines.filter((l) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(l)).at(-1);
    const password = lines[lines.lastIndexOf(email) + 1];
    const user = await p.user.findFirst({ where: { email }, select: { id: true, email: true, userRoles: { select: { role: { select: { code: true } } } } } });
    console.log("login user roles:", user?.userRoles.map((r) => r.role.code));
    const legal = await p.adminUpdateAnnouncement.findFirst({ where: { title: LEGAL }, select: { id: true, audienceRoles: true, status: true } });
    const read = user && legal ? await p.adminUpdateRead.findUnique({ where: { announcementId_adminUserId: { announcementId: legal.id, adminUserId: user.id } } }) : null;
    console.log("legal read before reset:", read);
    if (user && legal) await p.adminUpdateRead.deleteMany({ where: { announcementId: legal.id, adminUserId: user.id } });
    const loginRes = await fetch(`${BASE}/auth/login`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, password }) });
    const login = await loginRes.json();
    const token = login.tokens?.accessToken ?? login.accessToken ?? login.access_token;
    const activeRes = await fetch(`${BASE}/api/admin/v1/updates/active`, { headers: { authorization: `Bearer ${token}` } });
    const active = await activeRes.json();
    console.log("active after read reset:", activeRes.status, active.primary?.title ?? "none");
    const unauthorized = await fetch(`${BASE}/api/admin/v1/updates`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ title: "should fail", summary: "x", content: "x", type: "FEATURE", audienceRoles: ["ADMIN"] }) });
    console.log("unauthorized mutate:", unauthorized.status);
  } finally { await p.$disconnect(); }
}
main().catch((e) => { console.error(e); process.exitCode = 1; });
