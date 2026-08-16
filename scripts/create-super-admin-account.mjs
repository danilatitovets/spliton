#!/usr/bin/env node
import { createRequire } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { PrismaClient, UserRoleCode, UserStatus } from "@prisma/client";

function loadEnvFile() {
  const path = resolve(process.cwd(), ".env");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    if (!(key in process.env)) process.env[key] = value;
  }
}
loadEnvFile();
const require = createRequire(resolve("apps/backend/package.json"));
const bcrypt = require("bcrypt");
const EMAIL = (process.argv[2] ?? "").trim().toLowerCase();
const PASSWORD = process.argv[3] ?? "";
if (!EMAIL || !PASSWORD) { console.error("Usage: node scripts/create-super-admin-account.mjs <email> <password>"); process.exit(1); }
const prisma = new PrismaClient();
try {
  await prisma.role.upsert({ where: { code: UserRoleCode.SUPER_ADMIN }, update: { name: "Super Admin" }, create: { code: UserRoleCode.SUPER_ADMIN, name: "Super Admin" } });
  const superRole = await prisma.role.findUnique({ where: { code: UserRoleCode.SUPER_ADMIN } });
  if (!superRole) throw new Error("SUPER_ADMIN role missing");
  const passwordHash = await bcrypt.hash(PASSWORD, 12);
  let user = await prisma.user.findUnique({ where: { email: EMAIL }, include: { userRoles: { include: { role: true } } } });
  if (!user) {
    user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({ data: { email: EMAIL, passwordHash, status: UserStatus.ACTIVE, emailVerifiedAt: new Date() } });
      await tx.userProfile.create({ data: { userId: created.id, displayName: "Spliton Admin" } });
      await tx.userRole.create({ data: { userId: created.id, roleId: superRole.id } });
      return tx.user.findUniqueOrThrow({ where: { id: created.id }, include: { userRoles: { include: { role: true } } } });
    });
    console.log(`Created user: ${EMAIL}`);
  } else {
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash, status: UserStatus.ACTIVE, emailVerifiedAt: user.emailVerifiedAt ?? new Date() } });
    if (!user.userRoles.some((r) => r.role.code === UserRoleCode.SUPER_ADMIN)) {
      await prisma.userRole.create({ data: { userId: user.id, roleId: superRole.id } });
      console.log(`Granted SUPER_ADMIN to ${EMAIL}`);
    } else {
      console.log(`Updated password for existing SUPER_ADMIN: ${EMAIL}`);
    }
  }
  const final = await prisma.user.findUnique({ where: { email: EMAIL }, include: { userRoles: { include: { role: { select: { code: true } } } } } });
  console.log(JSON.stringify({ email: final?.email, status: final?.status, emailVerified: Boolean(final?.emailVerifiedAt), roles: final?.userRoles.map((r) => r.role.code) }, null, 2));
} catch (error) {
  console.error("Failed:", error instanceof Error ? error.message : error);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}