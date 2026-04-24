/* eslint-disable @typescript-eslint/no-require-imports */
const killPort = require("kill-port");

const ports = process.argv
  .slice(2)
  .map((p) => Number.parseInt(p, 10))
  .filter((n) => !Number.isNaN(n) && n > 0);

async function main() {
  for (const port of ports) {
    try {
      await killPort(port);
    } catch {
      // Порт свободен или процесс уже завершён — не считаем ошибкой.
    }
  }
}

main().then(() => process.exit(0)).catch(() => process.exit(0));
