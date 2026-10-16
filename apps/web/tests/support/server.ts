import { spawn } from "node:child_process";
import type { ChildProcess } from "node:child_process";
import { once } from "node:events";
import { fileURLToPath } from "node:url";

import { retry } from "es-toolkit/function";

export const e2eBaseURL = `http://localhost:${process.env.E2E_TEST_PORT ?? "3200"}`;

const webDir = fileURLToPath(new URL("../..", import.meta.url));

const waitForServer = async (url: string, attempts = 100): Promise<void> => {
  await retry(
    async () => {
      const response = await fetch(url);
      await response.arrayBuffer();
      if (!response.ok) {
        throw new Error(`Server did not become healthy at ${url}`);
      }
    },
    { delay: 100, retries: attempts }
  );
};

const start = (cwd: string, args: string[], env: Record<string, string>) =>
  spawn(process.execPath, args, {
    cwd,
    detached: true,
    env: { ...process.env, ...env },
    // Vite closes its server on stdin EOF outside CI; keep this pipe open until teardown.
    stdio: ["pipe", "inherit", "inherit"],
  });

const stop = async (child: ChildProcess) => {
  if (
    child.pid === undefined ||
    child.exitCode !== null ||
    child.signalCode !== null
  ) {
    return;
  }
  const exited = once(child, "exit");

  if (process.platform === "win32") {
    // Windows don't support using negative PID to kill a process group
    process.kill(child.pid, "SIGTERM");
  } else {
    process.kill(-child.pid, "SIGTERM");
  }

  await exited;
};

export const startTestServer = async (baseURL: string) => {
  const { port } = new URL(baseURL);
  const children: ChildProcess[] = [];
  const stopAll = async () => {
    await Promise.all(children.map(stop));
  };

  try {
    children.push(
      start(
        webDir,
        [
          "node_modules/vite-plus/bin/vp",
          "dev",
          "--port",
          port,
          "--strictPort",
        ],
        {}
      )
    );
    await waitForServer(`${baseURL}/`);
  } catch (error) {
    await stopAll();
    throw error;
  }
  return stopAll;
};
