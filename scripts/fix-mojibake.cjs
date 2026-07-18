const fs = require('node:fs');
const path = require('node:path');

const roots = ['backend', 'frontend/src', 'mobile'];
const extensionesPermitidas = new Set(['.js', '.jsx', '.ts', '.tsx', '.css', '.md', '.json']);
const directoriosIgnorados = new Set(['node_modules', 'dist', '.git', '.expo', 'coverage']);
const helperMojibake = path.normalize('frontend/src/shared/utils/normalizarTextoMojibake.ts');

const reemplazos = new Map([
  ['\u00C3\u00A1', 'á'],
  ['\u00C3\u00A9', 'é'],
  ['\u00C3\u00AD', 'í'],
  ['\u00C3\u00B3', 'ó'],
  ['\u00C3\u00BA', 'ú'],
  ['\u00C3\u0081', 'Á'],
  ['\u00C3\u2030', 'É'],
  ['\u00C3\u0089', 'É'],
  ['\u00C3\u008D', 'Í'],
  ['\u00C3\u201C', 'Ó'],
  ['\u00C3\u0093', 'Ó'],
  ['\u00C3\u0161', 'Ú'],
  ['\u00C3\u009A', 'Ú'],
  ['\u00C3\u00B1', 'ñ'],
  ['\u00C3\u2018', 'Ñ'],
  ['\u00C3\u0091', 'Ñ'],
  ['\u00C3\u00BC', 'ü'],
  ['\u00C3\u009C', 'Ü'],
  ['\u00C2\u00A1', '¡'],
  ['\u00C2\u00BF', '¿'],
  ['\u00C2\u00B0', '°'],
  ['\u00C2\u00B4', '´'],
  ['\u00C2\u00B7', '·'],
  ['\u00C2', ''],
  ['\u00E2\u20AC\u201C', '–'],
  ['\u00E2\u20AC\u201D', '—'],
  ['\u00E2\u20AC\u0153', '“'],
  ['\u00E2\u20AC\u009D', '”'],
  ['\u00E2\u20AC\u02DC', '‘'],
  ['\u00E2\u20AC\u2122', '’'],
  ['\u00E2\u20AC\u00A6', '…'],
  ['\u00E2\u20AC\u00A2', '•'],
  ['\u00E2\u201D\u20AC', '─'],
  ['\u00E2\u201D\u201A', '│'],
  ['\u00E2\u201D\u0152', '┌'],
  ['\u00E2\u201D\u0090', '┐'],
  ['\u00E2\u201D\u201D', '└'],
  ['\u00E2\u201D\u02DC', '┘']
]);

const helperContent = `const reemplazosMojibake: Array<[string, string]> = [
  ['\\\\u00C3\\\\u00A1', 'á'],
  ['\\\\u00C3\\\\u00A9', 'é'],
  ['\\\\u00C3\\\\u00AD', 'í'],
  ['\\\\u00C3\\\\u00B3', 'ó'],
  ['\\\\u00C3\\\\u00BA', 'ú'],
  ['\\\\u00C3\\\\u0081', 'Á'],
  ['\\\\u00C3\\\\u2030', 'É'],
  ['\\\\u00C3\\\\u0089', 'É'],
  ['\\\\u00C3\\\\u008D', 'Í'],
  ['\\\\u00C3\\\\u201C', 'Ó'],
  ['\\\\u00C3\\\\u0093', 'Ó'],
  ['\\\\u00C3\\\\u0161', 'Ú'],
  ['\\\\u00C3\\\\u009A', 'Ú'],
  ['\\\\u00C3\\\\u00B1', 'ñ'],
  ['\\\\u00C3\\\\u2018', 'Ñ'],
  ['\\\\u00C3\\\\u0091', 'Ñ'],
  ['\\\\u00C2\\\\u00A1', '¡'],
  ['\\\\u00C2\\\\u00BF', '¿'],
  ['\\\\u00E2\\\\u20AC\\\\u201C', '–'],
  ['\\\\u00E2\\\\u20AC\\\\u201D', '—'],
  ['\\\\u00E2\\\\u20AC\\\\u02DC', '‘'],
  ['\\\\u00E2\\\\u20AC\\\\u2122', '’'],
  ['\\\\u00E2\\\\u20AC\\\\u0153', '“'],
  ['\\\\u00E2\\\\u20AC\\\\u009D', '”']
];

export function normalizarTextoMojibake(texto: string) {
  return reemplazosMojibake.reduce(
    (textoNormalizado, [origen, destino]) => textoNormalizado.replaceAll(origen, destino),
    texto
  );
}
`;

function recorrerArchivos(directorio, archivos = []) {
  if (!fs.existsSync(directorio)) return archivos;

  for (const entrada of fs.readdirSync(directorio, { withFileTypes: true })) {
    if (directoriosIgnorados.has(entrada.name)) continue;

    const rutaCompleta = path.join(directorio, entrada.name);

    if (entrada.isDirectory()) {
      recorrerArchivos(rutaCompleta, archivos);
      continue;
    }

    if (extensionesPermitidas.has(path.extname(entrada.name))) {
      archivos.push(rutaCompleta);
    }
  }

  return archivos;
}

function normalizarArchivo(rutaArchivo) {
  const rutaNormalizada = path.normalize(rutaArchivo);

  if (rutaNormalizada === helperMojibake) {
    return false;
  }

  const contenidoOriginal = fs.readFileSync(rutaArchivo, 'utf8');
  let contenidoActualizado = contenidoOriginal;

  for (const [origen, destino] of reemplazos) {
    contenidoActualizado = contenidoActualizado.split(origen).join(destino);
  }

  if (contenidoActualizado === contenidoOriginal) {
    return false;
  }

  fs.writeFileSync(rutaArchivo, contenidoActualizado, 'utf8');
  return true;
}

const archivosActualizados = [];

for (const raiz of roots) {
  for (const archivo of recorrerArchivos(raiz)) {
    if (normalizarArchivo(archivo)) {
      archivosActualizados.push(archivo);
    }
  }
}

fs.writeFileSync(helperMojibake, helperContent, 'utf8');
archivosActualizados.push(helperMojibake);

console.log(`Archivos normalizados: ${archivosActualizados.length}`);
for (const archivo of archivosActualizados) {
  console.log(`- ${archivo}`);
}