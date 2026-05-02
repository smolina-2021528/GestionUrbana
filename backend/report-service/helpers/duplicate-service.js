// este servicio se encarga de detectar reportes similares o duplicados.
import { Op, QueryTypes } from 'sequelize';
import { sequelize }      from '../configs/db.js';
import { Report }         from '../src/reports/report.model.js';
import { ReportImage }    from '../src/reports/report-image.model.js';
import { User }           from '../src/users/user-ref.model.js';

/** Radio mÃ¡ximo en metros para buscar candidatos geogrÃ¡ficamente. */
const GEO_RADIUS_M = 100;

/** Score mÃ­nimo (0â€“1) para considerar dos reportes como "similares". */
export const SIMILARITY_THRESHOLD = 0.45;

/** Score mÃ­nimo (0â€“1) para marcar como "duplicado probable". */
export const DUPLICATE_THRESHOLD = 0.75;

/** NÃºmero mÃ¡ximo de candidatos a comparar. */
const MAX_CANDIDATES = 200;

// esta lista detecta que palabras comunes no aportan valor a la similitud y las ignora.
const STOPWORDS = new Set([
    'de','la','el','en','y','a','los','las','del','se','un','una','por',
    'con','no','es','que','al','su','lo','le','ha','hay','para','como',
    'pero','mas','ya','si','sobre','este','esta','estos','estas','muy',
    'hay','fue','ser','son','han','tiene','entre','desde','cuando','donde',
    'porque','esto','ese','esa','sin','o','e','u','ni','aunque',
]);

const tokenize = (text) => {
    if (!text || typeof text !== 'string') return [];
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // eliminar tildes
        .replace(/[^a-z\s]/g, ' ')       // eliminar no-letras
        .split(/\s+/)
        .filter((w) => w.length > 2 && !STOPWORDS.has(w));
};

const buildTF = (tokens) => {
    const tf = new Map();
    for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);
    for (const [k, v] of tf.entries()) tf.set(k, v / tokens.length);
    return tf;
};


const cosineSimilarity = (tfA, tfB) => {
    let dot = 0;
    let normA = 0;
    let normB = 0;

    for (const [term, valA] of tfA.entries()) {
        const valB = tfB.get(term) ?? 0;
        dot   += valA * valB;
        normA += valA * valA;
    }
    for (const [, valB] of tfB.entries()) normB += valB * valB;

    if (normA === 0 || normB === 0) return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
};

export const textSimilarity = (a, b) => {
    const tokensATitle = tokenize(a.Title ?? '');
    const tokensBTitle = tokenize(b.Title ?? '');
    const tokensADesc  = tokenize(a.Description ?? '');
    const tokensBDesc  = tokenize(b.Description ?? '');

    const simTitle = cosineSimilarity(buildTF(tokensATitle), buildTF(tokensBTitle));
    const simDesc  = cosineSimilarity(buildTF(tokensADesc),  buildTF(tokensBDesc));

    return simTitle * 0.4 + simDesc * 0.6;
};


export const combinedScore = (base, candidate, distanceM = null) => {
    const textScore = textSimilarity(base, candidate);

    const categoryBonus =
        base.Category && candidate.Category && base.Category === candidate.Category
            ? 0.25
            : 0;

    let geoBonus = 0;
    if (
        distanceM !== null &&
        distanceM <= GEO_RADIUS_M &&
        base.Latitude != null && base.Longitude != null &&
        candidate.Latitude != null && candidate.Longitude != null
    ) {
        // A menor distancia, mayor bonus. Escala lineal de 0.15 (0 m) a 0 (100 m).
        geoBonus = 0.15 * (1 - distanceM / GEO_RADIUS_M);
    }

    return Math.min(1, textScore * 0.60 + categoryBonus + geoBonus);
};


const lightIncludes = () => [
    { model: ReportImage, as: 'Images', attributes: ['ImageUrl', 'Order'] },
    { model: User, as: 'Citizen', attributes: ['Id', 'Username', 'Name'] },
];


export const fetchCandidates = async (baseReport) => {
    const excludeId = baseReport.Id;

    // Si tiene coordenadas, buscar por proximidad geogrÃ¡fica ampliada (500 m)
    if (baseReport.Latitude != null && baseReport.Longitude != null) {
        const refPoint = sequelize.fn(
            'ST_SetSRID',
            sequelize.fn('ST_MakePoint', baseReport.Longitude, baseReport.Latitude),
            4326,
        );
        const refPointGeog = sequelize.fn(
            'ST_GeogFromWKB',
            sequelize.cast(refPoint, 'geometry'),
        );
        const locationGeog = sequelize.fn(
            'ST_GeogFromWKB',
            sequelize.cast(sequelize.col('location'), 'geometry'),
        );

        try {
            const { rows: geoRows } = await Report.findAndCountAll({
                where: {
                    Id:       { [Op.ne]: excludeId },
                    Status:   { [Op.notIn]: ['RECHAZADO'] },
                    Location: { [Op.ne]: null },
                    [Op.and]: [
                        sequelize.where(
                            sequelize.fn('ST_DWithin', locationGeog, refPointGeog, 500),
                            true,
                        ),
                    ],
                },
                include: lightIncludes(),
                order: [[sequelize.fn('ST_Distance', locationGeog, refPointGeog), 'ASC']],
                limit: MAX_CANDIDATES,
            });

            // Complementar con reportes de la misma categorÃ­a sin ubicaciÃ³n
            const nonGeoCandidates = await Report.findAll({
                where: {
                    Id:       { [Op.ne]: excludeId },
                    Category: baseReport.Category,
                    Location: null,
                    Status:   { [Op.notIn]: ['RECHAZADO'] },
                },
                include: lightIncludes(),
                order: [['created_at', 'DESC']],
                limit: Math.max(0, MAX_CANDIDATES - geoRows.length),
            });

            return [...geoRows, ...nonGeoCandidates];
        } catch {
            // Fallback: bÃºsqueda por categorÃ­a si PostGIS falla
        }
    }

    // Sin coordenadas: buscar por categorÃ­a
    return Report.findAll({
        where: {
            Id:       { [Op.ne]: excludeId },
            Category: baseReport.Category,
            Status:   { [Op.notIn]: ['RECHAZADO'] },
        },
        include: lightIncludes(),
        order:   [['created_at', 'DESC']],
        limit:   MAX_CANDIDATES,
    });
};

const haversineMeters = (lat1, lon1, lat2, lon2) => {
    const R = 6_371_000;
    const toRad = (d) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const findSimilarReports = async (baseReport, opts = {}) => {
    const { limit = 5, threshold = SIMILARITY_THRESHOLD } = opts;

    const candidates = await fetchCandidates(baseReport);
    if (!candidates.length) return [];

    const results = [];

    for (const candidate of candidates) {
        let distanceM = null;
        if (
            baseReport.Latitude != null && baseReport.Longitude != null &&
            candidate.Latitude  != null && candidate.Longitude  != null
        ) {
            distanceM = haversineMeters(
                parseFloat(baseReport.Latitude),
                parseFloat(baseReport.Longitude),
                parseFloat(candidate.Latitude),
                parseFloat(candidate.Longitude),
            );
        }

        const score = combinedScore(baseReport, candidate, distanceM);

        if (score >= threshold) {
            results.push({
                report:      candidate,
                score:       parseFloat(score.toFixed(4)),
                isDuplicate: score >= DUPLICATE_THRESHOLD,
                distanceM:   distanceM !== null ? Math.round(distanceM) : null,
            });
        }
    }

    results.sort((a, b) => b.score - a.score);

    return results.slice(0, limit);
};

export const checkDraftForDuplicates = async (draft, opts = {}) => {
    const { limit = 3, threshold = SIMILARITY_THRESHOLD } = opts;

    const pseudoReport = {
        Id:          '__draft__',
        Title:       draft.title       ?? '',
        Description: draft.description ?? '',
        Category:    draft.category,
        Latitude:    draft.latitude    ?? null,
        Longitude:   draft.longitude   ?? null,
    };

    const similar = await findSimilarReports(pseudoReport, { limit, threshold });

    return {
        hasDuplicates: similar.some((r) => r.isDuplicate),
        candidates:    similar,
    };
};


