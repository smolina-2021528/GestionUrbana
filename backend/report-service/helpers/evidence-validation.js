import { REPORT_CATEGORIES } from './report-constants.js';

const STOPWORDS = new Set([
  'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'de', 'del', 'al', 'a', 'ante',
  'bajo', 'con', 'contra', 'desde', 'durante', 'en', 'entre', 'hacia', 'hasta', 'para',
  'por', 'segun', 'sin', 'sobre', 'tras', 'y', 'o', 'u', 'que', 'se', 'su', 'sus', 'mi',
  'mis', 'tu', 'tus', 'es', 'son', 'esta', 'este', 'estos', 'estas', 'hay', 'muy', 'mas',
  'menos', 'como', 'donde', 'cuando', 'problema', 'reporte', 'incidencia', 'zona', 'calle',
  'lugar', 'area', 'sector'
]);

const CATEGORY_KEYWORDS = {
  INFRAESTRUCTURA: [
    'bache', 'hoyo', 'agujero', 'calle', 'avenida', 'asfalto', 'acera', 'banqueta', 'drenaje',
    'alcantarilla', 'poste', 'alumbrado', 'lampara', 'semaforo', 'puente', 'tuberia', 'fuga',
    'hundimiento', 'cuneta', 'infraestructura', 'vial', 'ruta'
  ],
  SEGURIDAD: [
    'seguridad', 'riesgo', 'peligro', 'robo', 'asalto', 'violencia', 'vandalismo', 'accidente',
    'cable', 'electrico', 'expuesto', 'arma', 'amenaza', 'oscuridad', 'inseguridad', 'emergencia',
    'peligroso'
  ],
  LIMPIEZA: [
    'basura', 'desecho', 'residuo', 'contaminacion', 'sucio', 'sucia', 'limpieza', 'vertedero',
    'escombro', 'mal olor', 'inundacion', 'agua', 'estancada', 'animal', 'muerto', 'plaga',
    'reciclaje'
  ]
};

function limpiarTexto(valor) {
  return String(valor ?? '').trim();
}

function normalizarTexto(valor) {
  return limpiarTexto(valor)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9ñs]/g, ' ')
    .replace(/s+/g, ' ')
    .trim();
}

function tokenizar(valor) {
  const texto = normalizarTexto(valor);

  if (!texto) {
    return [];
  }

  return texto
    .split(' ')
    .map((token) => token.trim())
    .filter((token) => token.length >= 3 && !STOPWORDS.has(token));
}

function obtenerTokensUnicos(valor) {
  return [...new Set(tokenizar(valor))];
}

function calcularSimilitud(tokensA, tokensB) {
  if (tokensA.length === 0 || tokensB.length === 0) {
    return 0;
  }

  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  const interseccion = [...setA].filter((token) => setB.has(token)).length;
  const union = new Set([...setA, ...setB]).size;
  const coberturaA = interseccion / setA.size;
  const coberturaB = interseccion / setB.size;
  const jaccard = union > 0 ? interseccion / union : 0;

  return Math.max(jaccard, coberturaA * 0.75, coberturaB * 0.75);
}

function obtenerKeywordsCategoria(categoria) {
  return CATEGORY_KEYWORDS[categoria] ?? [];
}

function calcularSimilitudCategoria(textoUsuario, textoIa, categoria) {
  if (!categoria || !REPORT_CATEGORIES.includes(categoria)) {
    return 0;
  }

  const keywords = obtenerKeywordsCategoria(categoria).map(normalizarTexto);
  const textoUsuarioNormalizado = normalizarTexto(textoUsuario);
  const textoIaNormalizado = normalizarTexto(textoIa);

  if (!textoUsuarioNormalizado && !textoIaNormalizado) {
    return 0;
  }

  const usuarioCoincide = keywords.some((keyword) => keyword && textoUsuarioNormalizado.includes(keyword));
  const iaCoincide = keywords.some((keyword) => keyword && textoIaNormalizado.includes(keyword));

  if (usuarioCoincide && iaCoincide) {
    return 1;
  }

  if (usuarioCoincide || iaCoincide) {
    return 0.45;
  }

  return 0;
}

function redondearScore(valor) {
  return Math.max(0, Math.min(1, Number(valor.toFixed(2))));
}

function construirRazon(texto, activo) {
  return activo ? texto : null;
}

export function buildEvidenceValidation(geminiResult, context = {}) {
  const title = limpiarTexto(context.title);
  const description = limpiarTexto(context.description);
  const category = limpiarTexto(context.category).toUpperCase();
  const hasUserContext = Boolean(title || description || category);

  if (!hasUserContext) {
    return {
      status: 'NO_CONTEXT',
      isRelevant: true,
      shouldWarn: false,
      score: null,
      confidence: 'none',
      message: 'La imagen fue analizada, pero no se comparó contra datos del reporte porque aún no hay suficiente contexto.',
      reasons: ['Completa título, descripción o categoría para validar coincidencia.'],
      comparedWith: {
        titleProvided: false,
        descriptionProvided: false,
        categoryProvided: false
      }
    };
  }

  const userText = [title, description].filter(Boolean).join(' ');
  const aiText = [geminiResult?.title, geminiResult?.description].filter(Boolean).join(' ');
  const userTokens = obtenerTokensUnicos(userText);
  const aiTokens = obtenerTokensUnicos(aiText);
  const textScore = calcularSimilitud(userTokens, aiTokens);
  const categoryMatches = REPORT_CATEGORIES.includes(category) && category === geminiResult?.category;
  const categoryScore = REPORT_CATEGORIES.includes(category) ? (categoryMatches ? 1 : 0) : 0.5;
  const keywordScore = calcularSimilitudCategoria(userText, aiText, category || geminiResult?.category);
  const score = redondearScore((textScore * 0.45) + (categoryScore * 0.35) + (keywordScore * 0.2));

  const reasons = [
    construirRazon('La categoría indicada coincide con la categoría sugerida por la imagen.', categoryMatches),
    construirRazon('La imagen y la descripción comparten palabras o señales similares.', textScore >= 0.25),
    construirRazon('La imagen parece relacionada con el tipo de problema reportado.', keywordScore >= 0.45),
    construirRazon('La categoría indicada no coincide con la lectura automática de la imagen.', REPORT_CATEGORIES.includes(category) && !categoryMatches),
    construirRazon('La descripción y la imagen no comparten suficientes señales.', textScore < 0.15)
  ].filter(Boolean);

  if (score >= 0.55) {
    return {
      status: 'RELATED',
      isRelevant: true,
      shouldWarn: false,
      score,
      confidence: score >= 0.75 ? 'high' : 'medium',
      message: 'La imagen parece relacionada con el reporte.',
      reasons,
      comparedWith: {
        titleProvided: Boolean(title),
        descriptionProvided: Boolean(description),
        categoryProvided: REPORT_CATEGORIES.includes(category),
        suggestedCategory: geminiResult?.category ?? null
      }
    };
  }

  if (score >= 0.3) {
    return {
      status: 'REVIEW',
      isRelevant: true,
      shouldWarn: true,
      score,
      confidence: 'medium',
      message: 'La imagen puede estar relacionada, pero conviene revisar título, descripción o categoría antes de enviar.',
      reasons,
      comparedWith: {
        titleProvided: Boolean(title),
        descriptionProvided: Boolean(description),
        categoryProvided: REPORT_CATEGORIES.includes(category),
        suggestedCategory: geminiResult?.category ?? null
      }
    };
  }

  return {
    status: 'UNRELATED',
    isRelevant: false,
    shouldWarn: true,
    score,
    confidence: 'low',
    message: 'La imagen no parece coincidir con el reporte. Cambia la foto o ajusta la información antes de enviarlo.',
    reasons,
    comparedWith: {
      titleProvided: Boolean(title),
      descriptionProvided: Boolean(description),
      categoryProvided: REPORT_CATEGORIES.includes(category),
      suggestedCategory: geminiResult?.category ?? null
    }
  };
}
