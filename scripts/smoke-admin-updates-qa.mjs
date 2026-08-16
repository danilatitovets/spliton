/**
 * Final smoke QA for Admin Updates module.
 * Usage: node scripts/smoke-admin-updates-qa.mjs
 */
import { readFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";

const BASE = process.env.API_BASE ?? "http://localhost:4001";
const LEGAL_TITLE = "Обновлён раздел юридических документов";
const prisma = new PrismaClient();

function loadCreds() {
  try {
    const lines = readFileSync("spliton_pass.txt", "utf8")
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    const emails = lines.filter((l) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(l));
    const email = emails.at(-1);
    if (!email) return null;
    const idx = lines.lastIndexOf(email);
    const password = lines[idx + 1];
    if (!password || password.includes("@")) return null;
    return { email, password };
  } catch {
    return null;
  }
}

async function login(email, password) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`login ${res.status}: ${JSON.stringify(body)}`);
  const token =
    body.tokens?.accessToken ?? body.accessToken ?? body.access_token ?? body.token;
  if (!token) throw new Error("no access token in login response");
  return token;
}

async function api(method, path, token, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      ...(body ? { "content-type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = text;
  }
  return { status: res.status, json };
}

async function checkDatabase(out) {
  const mig = await prisma.$queryRaw`
    SELECT migration_name, finished_at, rolled_back_at
    FROM _prisma_migrations
    WHERE migration_name = '20260627140000_admin_update_announcements'
  `;
  out.migrationApplied =
    mig.length === 1 && mig[0].finished_at != null && mig[0].rolled_back_at == null;

  const tables = await prisma.$queryRaw`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN ('admin_update_announcements', 'admin_update_reads')
    ORDER BY 1
  `;
  out.tablesExist = tables.map((t) => t.table_name).join(",") ===
    "admin_update_announcements,admin_update_reads";

  const idx = await prisma.$queryRaw`
    SELECT indexname, indexdef
    FROM pg_indexes
    WHERE tablename = 'admin_update_reads'
      AND indexname = 'admin_update_reads_announcement_admin_uidx'
  `;
  out.uniqueIndex = idx.length === 1;

  const legalRows = await prisma.adminUpdateAnnouncement.findMany({
    where: { type: "LEGAL", title: LEGAL_TITLE },
    select: { id: true, status: true, publishedAt: true },
  });
  out.legalSeedCount = legalRows.length;
  out.legalSeedPublished = legalRows.some((r) => r.status === "PUBLISHED");
}

async function runSeedTwice(out) {
  const { execSync } = await import("node:child_process");
  const r1 = execSync("npx tsx apps/backend/scripts/seed-admin-updates.ts", {
    cwd: process.cwd(),
    encoding: "utf8",
  }).trim();
  const r2 = execSync("npx tsx apps/backend/scripts/seed-admin-updates.ts", {
    cwd: process.cwd(),
    encoding: "utf8",
  }).trim();
  out.seedRun1 = r1;
  out.seedRun2 = r2;
  const after = await prisma.adminUpdateAnnouncement.count({
    where: { type: "LEGAL", title: LEGAL_TITLE },
  });
  out.legalSeedCountAfter = after;
}

async function checkUpsert(out, adminUserId, announcementId) {
  const now = new Date();
  const r1 = await prisma.adminUpdateRead.upsert({
    where: {
      announcementId_adminUserId: { announcementId, adminUserId },
    },
    create: { announcementId, adminUserId, readAt: now },
    update: { readAt: now },
  });
  const r2 = await prisma.adminUpdateRead.upsert({
    where: {
      announcementId_adminUserId: { announcementId, adminUserId },
    },
    create: { announcementId, adminUserId, readAt: now, dismissedAt: now },
    update: { dismissedAt: now },
  });
  out.upsertSameRow = r1.id === r2.id;
  const count = await prisma.adminUpdateRead.count({
    where: { announcementId, adminUserId },
  });
  out.upsertSingleRow = count === 1;
}

async function checkApi(out, token, adminUserId) {
  const active = await api("GET", "/api/admin/v1/updates/active", token);
  out.activeStatus = active.status;
  out.activeHasPrimary = Boolean(active.json?.primary?.id);

  const history = await api("GET", "/api/admin/v1/updates/history", token);
  out.historyStatus = history.status;
  out.historyCount = Array.isArray(history.json) ? history.json.length : -1;

  const manage = await api("GET", "/api/admin/v1/updates/manage", token);
  out.manageStatus = manage.status;
  out.manageCount = Array.isArray(manage.json) ? manage.json.length : -1;

  // DRAFT not in active
  const draft = await prisma.adminUpdateAnnouncement.create({
    data: {
      title: `QA DRAFT ${Date.now()}`,
      summary: "smoke draft",
      content: "draft body",
      type: "SYSTEM",
      status: "DRAFT",
      audienceRoles: ["ADMIN"],
      createdByAdminId: adminUserId,
      updatedByAdminId: adminUserId,
    },
  });
  out.draftCreated = draft.id;
  const activeAfterDraft = await api("GET", "/api/admin/v1/updates/active", token);
  out.draftNotInActive = !(
    activeAfterDraft.json?.items ?? []
  ).some((i) => i.id === draft.id);

  // ARCHIVED not in active, in history
  const archived = await prisma.adminUpdateAnnouncement.create({
    data: {
      title: `QA ARCHIVED ${Date.now()}`,
      summary: "smoke archived",
      content: "archived body",
      type: "SYSTEM",
      status: "ARCHIVED",
      audienceRoles: ["ADMIN", "SUPER_ADMIN"],
      publishedAt: new Date(),
      createdByAdminId: adminUserId,
      updatedByAdminId: adminUserId,
    },
  });
  out.archivedCreated = archived.id;
  const activeAfterArchived = await api("GET", "/api/admin/v1/updates/active", token);
  out.archivedNotInActive = !(activeAfterArchived.json?.items ?? []).some(
    (i) => i.id === archived.id,
  );
  const historyAfterArchived = await api("GET", "/api/admin/v1/updates/history", token);
  out.archivedInHistory = (historyAfterArchived.json ?? []).some(
    (i) => i.id === archived.id,
  );

  // read + dismiss on published legal update
  const legal = await prisma.adminUpdateAnnouncement.findFirst({
    where: { type: "LEGAL", title: LEGAL_TITLE, status: "PUBLISHED" },
  });
  if (legal) {
    await prisma.adminUpdateRead.deleteMany({
      where: { announcementId: legal.id, adminUserId },
    });
    const readRes = await api("POST", `/api/admin/v1/updates/${legal.id}/read`, token);
    out.readStatus = readRes.status;
    const dismissRes = await api(
      "POST",
      `/api/admin/v1/updates/${legal.id}/dismiss`,
      token,
    );
    out.dismissStatus = dismissRes.status;
    const activeAfterDismiss = await api("GET", "/api/admin/v1/updates/active", token);
    out.dismissedNotInActive = !(activeAfterDismiss.json?.items ?? []).some(
      (i) => i.id === legal.id,
    );
    const historyAfterDismiss = await api("GET", "/api/admin/v1/updates/history", token);
    const row = (historyAfterDismiss.json ?? []).find((i) => i.id === legal.id);
    out.dismissedInHistory = Boolean(row);
    out.dismissedFlag = Boolean(row?.isDismissed);
  }

  // mutate CRUD smoke (admin token)
  const createRes = await api("POST", "/api/admin/v1/updates", token, {
    title: `QA FEATURE ${Date.now()}`,
    summary: "feature summary",
    content: "feature content",
    type: "FEATURE",
    audienceRoles: ["ADMIN"],
  });
  out.createStatus = createRes.status;
  let createdId = createRes.json?.id ?? null;
  if (createdId) {
    const patchRes = await api("PATCH", `/api/admin/v1/updates/${createdId}`, token, {
      summary: "patched summary",
    });
    out.patchStatus = patchRes.status;
    const publishRes = await api(
      "POST",
      `/api/admin/v1/updates/${createdId}/publish`,
      token,
    );
    out.publishStatus = publishRes.status;
    const archiveRes = await api(
      "POST",
      `/api/admin/v1/updates/${createdId}/archive`,
      token,
    );
    out.archiveStatus = archiveRes.status;
    const activeAfterArchive = await api("GET", "/api/admin/v1/updates/active", token);
    out.publishedThenArchivedNotActive = !(activeAfterArchive.json?.items ?? []).some(
      (i) => i.id === createdId,
    );
  }

  // cleanup QA rows only (keep legal seed reads/state)
  await prisma.adminUpdateRead.deleteMany({
    where: { announcementId: { in: [draft.id, archived.id, createdId].filter(Boolean) } },
  });
  await prisma.adminUpdateAnnouncement.deleteMany({
    where: { id: { in: [draft.id, archived.id, createdId].filter(Boolean) } },
  });
}

async function checkRbac(out) {
  // Use prisma to find users with different roles if possible - login may not work for all
  // At minimum verify permissions module expectations via imported logic is tested in jest
  out.rbacNote = "covered by admin-updates-permissions.spec.ts (10 tests)";
}

async function checkFrontendCode(out) {
  const fs = await import("node:fs");
  const dash = fs.readFileSync(
    "apps/frontend/features/admin/sections/dashboard-section.tsx",
    "utf8",
  );
  out.dashboardHasNotice = dash.includes("AdminUpdateNotice");
  const notice = fs.readFileSync(
    "apps/frontend/features/admin/components/admin-update-notice.tsx",
    "utf8",
  );
  out.noticeUsesActiveApi = notice.includes("fetchAdminUpdatesActive");
  out.noticeDismiss = notice.includes("dismissAdminUpdate");
  out.noticeRead = notice.includes("markAdminUpdateRead");
  out.noticeNoHeavyShadow =
    !notice.includes("shadow-2xl") && !notice.includes("shadow-xl");
  const history = fs.readFileSync(
    "apps/frontend/features/admin/sections/admin-updates-section.tsx",
    "utf8",
  );
  out.historyFilter = history.includes("typeFilter");
  out.historyReadUnread = history.includes("admin.updates.read");
  const manage = fs.readFileSync(
    "apps/frontend/features/admin/sections/admin-updates-manage-section.tsx",
    "utf8",
  );
  out.manageMutateGate = manage.includes('canMatrixAction(user?.roles, "updates", "mutate")');
}

async function main() {
  const out = { ok: true, errors: [] };
  console.log("=== Admin Updates Smoke QA ===\n");

  await checkDatabase(out);
  console.log("[DB] migration applied:", out.migrationApplied);
  console.log("[DB] tables exist:", out.tablesExist);
  console.log("[DB] unique index:", out.uniqueIndex);
  console.log("[DB] legal seed count:", out.legalSeedCount);
  console.log("[DB] legal seed published:", out.legalSeedPublished);

  await runSeedTwice(out);
  console.log("[Seed] run1:", out.seedRun1);
  console.log("[Seed] run2:", out.seedRun2);
  console.log("[Seed] legal count after:", out.legalSeedCountAfter);

  const creds = loadCreds();
  if (!creds) {
    out.errors.push("no creds for API smoke");
    out.ok = false;
    console.log("[API] skipped - no creds");
  } else {
    try {
      const token = await login(creds.email, creds.password);
      const user = await prisma.user.findUnique({
        where: { email: creds.email },
        select: {
          id: true,
          userRoles: { select: { role: { select: { code: true } } } },
        },
      });
      const adminUserId = user?.id;
      const roles = user?.userRoles?.map((r) => r.role.code) ?? [];
      console.log("[API] logged in as:", creds.email, roles.join(","));

      const legal = await prisma.adminUpdateAnnouncement.findFirst({
        where: { type: "LEGAL", title: LEGAL_TITLE },
      });
      if (adminUserId && legal) {
        await checkUpsert(out, adminUserId, legal.id);
        console.log("[DB] upsert same row:", out.upsertSameRow);
        console.log("[DB] upsert single row:", out.upsertSingleRow);
      }

      await checkApi(out, token, adminUserId);
      console.log("[API] active:", out.activeStatus, "primary:", out.activeHasPrimary);
      console.log("[API] history:", out.historyStatus, "count:", out.historyCount);
      console.log("[API] manage:", out.manageStatus, "count:", out.manageCount);
      console.log("[API] draft not in active:", out.draftNotInActive);
      console.log("[API] archived not in active:", out.archivedNotInActive);
      console.log("[API] archived in history:", out.archivedInHistory);
      console.log("[API] read:", out.readStatus, "dismiss:", out.dismissStatus);
      console.log("[API] dismissed not in active:", out.dismissedNotInActive);
      console.log("[API] dismissed in history:", out.dismissedInHistory, "flag:", out.dismissedFlag);
      console.log("[API] create/patch/publish/archive:", out.createStatus, out.patchStatus, out.publishStatus, out.archiveStatus);
    } catch (e) {
      out.ok = false;
      out.errors.push(String(e));
      console.log("[API] error:", e.message);
    }
  }

  await checkRbac(out);
  await checkFrontendCode(out);
  console.log("\n[Frontend code] dashboard notice:", out.dashboardHasNotice);
  console.log("[Frontend code] notice APIs:", out.noticeUsesActiveApi, out.noticeDismiss, out.noticeRead);
  console.log("[Frontend code] flat style:", out.noticeNoHeavyShadow);
  console.log("[Frontend code] history filter/read:", out.historyFilter, out.historyReadUnread);
  console.log("[Frontend code] manage gate:", out.manageMutateGate);

  const checks = [
    out.migrationApplied,
    out.tablesExist,
    out.uniqueIndex,
    out.legalSeedCount === 1,
    out.legalSeedPublished,
    out.seedRun2?.includes("skipped"),
    out.legalSeedCountAfter === 1,
    out.draftNotInActive !== false,
    out.archivedNotInActive !== false,
    out.archivedInHistory !== false,
    out.dismissStatus === 200 || out.dismissStatus === 201,
    out.dismissedNotInActive !== false,
    out.dismissedInHistory !== false,
    out.dashboardHasNotice,
    out.manageMutateGate,
  ];
  const failed = checks.filter((c) => c !== true).length;
  console.log("\n=== Summary: ", failed === 0 && out.errors.length === 0 ? "PASS" : "ISSUES", "===");
  if (out.errors.length) console.log("Errors:", out.errors);
  console.log(JSON.stringify(out, null, 2));
  if (failed > 0 || out.errors.length) process.exitCode = 1;
}

try {
  await main();
} finally {
  await prisma.$disconnect();
}
