import { readdirSync, statSync } from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const includedDirectories = [
  path.join(projectRoot, 'backend'),
];

const ignoredDirectories = new Set([
  'node_modules',
  'dist',
  'build',
  'coverage',
  'uploads',
  '.git',
]);

function isIgnoredDirectory(directoryPath) {
  return directoryPath
    .split(path.sep)
    .some((segment) => ignoredDirectories.has(segment));
}

function collectJavaScriptFiles(directoryPath, files = []) {
  if (isIgnoredDirectory(directoryPath)) {
    return files;
  }

  const entries = readdirSync(directoryPath);

  for (const entry of entries) {
    const entryPath = path.join(directoryPath, entry);
    const entryStat = statSync(entryPath);

    if (entryStat.isDirectory()) {
      collectJavaScriptFiles(entryPath, files);
      continue;
    }

    if (entryStat.isFile() && entryPath.endsWith('.js')) {
      files.push(entryPath);
    }
  }

  return files;
}

function checkFileSyntax(filePath) {
  const result = spawnSync(process.execPath, ['--check', filePath], {
    cwd: projectRoot,
    encoding: 'utf8',
  });

  return {
    filePath,
    ok: result.status === 0,
    stdout: result.stdout,
    stderr: result.stderr,
  };
}

const files = includedDirectories.flatMap((directoryPath) =>
  collectJavaScriptFiles(directoryPath),
);

if (files.length === 0) {
  console.log('No se encontraron archivos JavaScript para verificar.');
  process.exit(0);
}

console.log(`Verificando sintaxis de ${files.length} archivo(s) backend...`);

const results = files.map(checkFileSyntax);
const failedResults = results.filter((result) => !result.ok);

if (failedResults.length === 0) {
  console.log('Verificación de sintaxis backend completada correctamente.');
  process.exit(0);
}

console.error(`Se encontraron errores de sintaxis en ${failedResults.length} archivo(s):`);

for (const result of failedResults) {
  const relativePath = path.relative(projectRoot, result.filePath);
  console.error(`\n${relativePath}`);
  console.error(result.stderr || result.stdout || 'Error desconocido.');
}

process.exit(1);