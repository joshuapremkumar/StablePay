import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import { resolve } from "node:path";

const port = process.env.PORT || "3000";
const distClientDir = resolve(process.cwd(), "dist", "client");
const targetDir = existsSync(distClientDir) ? "dist/client" : "dist";

const command =
  process.platform === "win32"
    ? `npx serve -s ${targetDir} -l ${port}`
    : `npx serve -s ${targetDir} -l ${port}`;

const child = spawn(command, {
  stdio: "inherit",
  env: process.env,
  cwd: process.cwd(),
  shell: true,
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});

child.on("error", (error) => {
  console.error(`Failed to serve ${targetDir}:`, error);
  process.exit(1);
});
