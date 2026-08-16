import { readFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";

const BASE = process.env.API_BASE ?? "http://localhost:4001";
const prisma = new PrismaClient();

const lines = readFileSync("spliton_pass.txt", "utf8")
  .split(/\r?\n/)
  .map((l) => l.trim())
  .filter(Boolean);
const emails = lines.filter((l) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(l));
const email = emails.at(-1);
const password = lines[lines.lastIndexOf(email) + 1];

const api = async (path, opts = {}) => {
  const res = await fetch(`${BASE}${path}`, opts);
  const body = await res.json().catch(() => null);
  return { status: res.status, body };
};

const log = (name, ok, detail = "") => {
  console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? `: ${detail}` : ""}`);
  if (!ok) process.exitCode = 1;
};

const loginRes = await api("/auth/login", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ email, password }),
});
const auth = {
  authorization: `Bearer ${loginRes.body.tokens.accessToken}`,
  "content-type": "application/json",
};

const active1 = await api("/api/admin/v1/updates/active", { headers: auth });
log("GET /updates/active", active1.status === 200, active1.body?.primary?.title ?? "none");

const history1 = await api("/api/admin/v1/updates/history", { headers: auth });
log(
  "GET /updates/history",
  history1.status === 200 && Array.isArray(history1.body),
  `count=${history1.body?.length ?? 0}`,
);

const manage1 = await api("/api/admin/v1/updates/manage", { headers: auth });
log(
  "GET /updates/manage",
  manage1.status === 200 && Array.isArray(manage1.body),
  `count=${manage1.body?.length ?? 0}`,
);

log(
  "DRAFT not in /active",
  !(active1.body?.items ?? []).some((i) => i.status === "DRAFT"),
);
log(
  "ARCHIVED not in /active",
  !(active1.body?.items ?? []).some((i) => i.status === "ARCHIVED"),
);

const create = await api("/api/admin/v1/updates", {
  method: "POST",
  headers: auth,
  body: JSON.stringify({
    title: `[smoke] ${Date.now()}`,
    summary: "smoke",
    content: "smoke body",
    type: "SYSTEM",
    audienceRoles: ["SUPER_ADMIN", "ADMIN"],
  }),
});
const id = create.body?.id;
log("POST /updates", Boolean(id), id ?? String(create.status));

const patch = await api(`/api/admin/v1/updates/${id}`, {
  method: "PATCH",
  headers: auth,
  body: JSON.stringify({ summary: "patched" }),
});
log("PATCH /updates/:id", patch.status === 200);

const publish = await api(`/api/admin/v1/updates/${id}/publish`, {
  method: "POST",
  headers: auth,
});
log("POST /updates/:id/publish", publish.status === 200 || publish.status === 201);

const active2 = await api("/api/admin/v1/updates/active", { headers: auth });
const visible =
  (active2.body?.items ?? []).some((i) => i.id === id) ||
  active2.body?.primary?.id === id;
log("published visible in /active", visible, id);

const read = await api(`/api/admin/v1/updates/${id}/read`, {
  method: "POST",
  headers: auth,
});
log("POST /updates/:id/read", read.status === 200 || read.status === 201);

const history2 = await api("/api/admin/v1/updates/history", { headers: auth });
log("read stays in /history", history2.body.some((h) => h.id === id));

const dismiss = await api(`/api/admin/v1/updates/${id}/dismiss`, {
  method: "POST",
  headers: auth,
});
log("POST /updates/:id/dismiss", dismiss.status === 200 || dismiss.status === 201);

const active3 = await api("/api/admin/v1/updates/active", { headers: auth });
const stillActive =
  (active3.body?.items ?? []).some((i) => i.id === id) ||
  active3.body?.primary?.id === id;
log("dismissed not in /active", !stillActive);

const history3 = await api("/api/admin/v1/updates/history", { headers: auth });
log("dismissed in /history", history3.body.some((h) => h.id === id));

const archive = await api(`/api/admin/v1/updates/${id}/archive`, {
  method: "POST",
  headers: auth,
});
log("POST /updates/:id/archive", archive.status === 200 || archive.status === 201);

const active4 = await api("/api/admin/v1/updates/active", { headers: auth });
const archivedActive =
  (active4.body?.items ?? []).some((i) => i.id === id) ||
  active4.body?.primary?.id === id;
log("archived not in /active", !archivedActive);

const history4 = await api("/api/admin/v1/updates/history", { headers: auth });
log(
  "archived in /history",
  history4.body.some((h) => h.id === id && h.status === "ARCHIVED"),
);

const reads = await prisma.adminUpdateRead.count({
  where: { announcementId: id, adminUserId: loginRes.body.user.id },
});
log("unique read row per admin", reads <= 1, `count=${reads}`);

await prisma.$disconnect();
