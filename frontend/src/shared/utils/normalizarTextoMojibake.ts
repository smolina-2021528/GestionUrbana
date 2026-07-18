const reemplazosMojibake: Array<[string, string]> = [
  ['\\u00C3\\u00A1', 'á'],
  ['\\u00C3\\u00A9', 'é'],
  ['\\u00C3\\u00AD', 'í'],
  ['\\u00C3\\u00B3', 'ó'],
  ['\\u00C3\\u00BA', 'ú'],
  ['\\u00C3\\u0081', 'Á'],
  ['\\u00C3\\u2030', 'É'],
  ['\\u00C3\\u0089', 'É'],
  ['\\u00C3\\u008D', 'Í'],
  ['\\u00C3\\u201C', 'Ó'],
  ['\\u00C3\\u0093', 'Ó'],
  ['\\u00C3\\u0161', 'Ú'],
  ['\\u00C3\\u009A', 'Ú'],
  ['\\u00C3\\u00B1', 'ñ'],
  ['\\u00C3\\u2018', 'Ñ'],
  ['\\u00C3\\u0091', 'Ñ'],
  ['\\u00C2\\u00A1', '¡'],
  ['\\u00C2\\u00BF', '¿'],
  ['\\u00E2\\u20AC\\u201C', '–'],
  ['\\u00E2\\u20AC\\u201D', '—'],
  ['\\u00E2\\u20AC\\u02DC', '‘'],
  ['\\u00E2\\u20AC\\u2122', '’'],
  ['\\u00E2\\u20AC\\u0153', '“'],
  ['\\u00E2\\u20AC\\u009D', '”']
];

export function normalizarTextoMojibake(texto: string) {
  return reemplazosMojibake.reduce(
    (textoNormalizado, [origen, destino]) => textoNormalizado.replaceAll(origen, destino),
    texto
  );
}
