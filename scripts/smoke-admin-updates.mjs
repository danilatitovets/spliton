import { readFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";

const BASE = process.env.API_BASE ?? "http://localhost:4001";
const prisma = new PrismaClient();

function loadCreds() {
  try {
    const lines = readFileSync("spliton_pass.txt", "utf8").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
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

async function main() {
  const seed = await prisma.adminUpdateAnnouncement.findFirst({
    where: { type: "LEGAL", title: "РћР±РЅРѕРІР»С‘РЅ СЂР°Р·РґРµР» СЋСЂРёРґРёС‡РµСЃРєРёС… РґРѕРєСѓРјРµРЅС‚РѕРІ" },
    select: { id: true, status: true },
  });
  console.log("seed:", seed ? "ok" : "missing");

  const creds = loadCreds();
  if (!creds) {
    console.log("api: skipped");
    return;
  }

  const loginRes = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: creds.email, password: creds.password }),
  });
  const login = await loginRes.json();
  if (!loginRes.ok) {
    console.log("login:", loginRes.status);
    process.exitCode = 1;
    return;
  }

  const token = login.tokens?.accessToken ?? login.accessToken ?? login.access_token ?? login.token;
  const headers = { authorization: `Bearer ${token}` };

  const activeRes = await fetch(`${BASE}/api/admin/v1/updates/active`, { headers });
  const active = await activeRes.json();
  console.log("active:", activeRes.status, active.primary?.title ?? "none");

  const historyRes = await fetch(`${BASE}/api/admin/v1/updates/history`, { headers });
  const history = await historyRes.json();
  console.log("history:", historyRes.status, Array.isArray(history) ? history.length : "bad");

  if (activeRes.status === 404) {
    console.log("hint: restart backend");
    process.exitCode = 1;
    return;
  }

  if (active.primary?.id) {
    const id = active.primary.id;
    const dismissRes = await fetch(`${BASE}/api/admin/v1/updates/${id}/dismiss`, { method: "POST", headers });
    console.log("dismiss:", dismissRes.status);
    const active2 = await (await fetch(`${BASE}/api/admin/v1/updates/active`, { headers })).json();
    console.log("active after dismiss:", active2.primary?.id ?? "none");
    const history2 = await (await fetch(`${BASE}/api/admin/v1/updates/history`, { headers })).json();
    console.log("history keeps dismissed:", Array.isArray(history2) && history2.some((h) => h.id === id));
  }
}

try {
  await main();
} finally {
  await prisma.$disconnect();
}