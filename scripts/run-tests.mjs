import { readdir } from "node:fs/promises";
import { spawn } from "node:child_process";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = join(repositoryRoot, "src");

const discoverTests = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await discoverTests(path));
    } else if (entry.isFile() && entry.name.endsWith(".test.ts")) {
      files.push(path);
    }
  }

  return files;
};

const testFiles = (await discoverTests(sourceRoot)).sort();

if (testFiles.length === 0) {
  console.error("No TypeScript test files were found beneath src.");
  process.exit(1);
}

console.log(`Discovered ${testFiles.length} test files:`);
for (const file of testFiles) {
  console.log(`  ${relative(repositoryRoot, file)}`);
}

// Invoke the tsx CLI through the current Node executable rather than spawning
// tsx.cmd directly. This avoids EINVAL on Windows and behaves consistently
// across shells and supported Node versions.
const tsxCli = join(repositoryRoot, "node_modules", "tsx", "dist", "cli.mjs");
const child = spawn(process.execPath, [tsxCli, "--test", ...testFiles], {
  cwd: repositoryRoot,
  stdio: "inherit",
  shell: false,
});

child.on("error", (error) => {
  console.error(`Unable to start the test runner: ${error.message}`);
  process.exit(1);
});

child.on("exit", (code, signal) => {
  if (signal) {
    console.error(`Test runner terminated by signal ${signal}.`);
    process.exit(1);
  }
  process.exit(code ?? 1);
});
