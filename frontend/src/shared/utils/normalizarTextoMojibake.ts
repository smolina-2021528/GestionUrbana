const reemplazosMojibake: Array<[string, string]> = [
  ['Ã¡', 'á'],
  ['Ã©', 'é'],
  ['Ã­', 'í'],
  ['Ã³', 'ó'],
  ['Ãº', 'ú'],
  ['ÃÁ', 'Á'],
  ['Ã‰', 'É'],
  ['ÃÍ', 'Í'],
  ['Ã“', 'Ó'],
  ['Ãš', 'Ú'],
  ['Ã±', 'ñ'],
  ['Ã‘', 'Ñ'],
  ['Â¡', '¡'],
  ['Â¿', '¿'],
  ['â€“', '–'],
  ['â€”', '—'],
  ['â€˜', '‘'],
  ['â€™', '’'],
  ['â€œ', '“'],
  ['â€', '”']
];

export function normalizarTextoMojibake(texto: string) {
  return reemplazosMojibake.reduce(
    (textoNormalizado, [origen, destino]) => textoNormalizado.replaceAll(origen, destino),
    texto
  );
}