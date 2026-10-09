// Hook PostToolUse: después de editar código, corre typecheck y tests.
// Si algo falla, sale con código 2 y el error le llega a Claude para que lo corrija.
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();

let input = '';
for await (const chunk of process.stdin) input += chunk;

let file = '';
try {
  file = JSON.parse(input).tool_input?.file_path ?? '';
} catch {
  process.exit(0);
}

const rel = path.relative(root, path.resolve(root, file)).split(path.sep).join('/');
const isCode = /^(src|scripts|tests)\/.*\.(ts|mjs)$/.test(rel) || rel === 'vite.config.ts';
if (!isCode) process.exit(0);

const run = (cmd, args) => spawnSync(cmd, args, { cwd: root, encoding: 'utf8', timeout: 50_000 });

const tsc = run('npx', ['--no-install', 'tsc', '--noEmit']);
if (tsc.status !== 0) {
  process.stderr.write(`Typecheck falló después de editar ${rel}:\n${(tsc.stdout + tsc.stderr).slice(0, 4000)}`);
  process.exit(2);
}

const tests = run('npm', ['test', '--silent']);
if (tests.status !== 0) {
  const failures = (tests.stdout + tests.stderr)
    .split('\n')
    .filter((l) => /not ok|Error|expected|actual|^\s+[+-] /.test(l))
    .slice(0, 60)
    .join('\n');
  process.stderr.write(`Tests fallaron después de editar ${rel} (corré npm test para el detalle):\n${failures}`);
  process.exit(2);
}
