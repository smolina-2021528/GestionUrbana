// Categorías disponibles para clasificación por IA
export const AI_REPORT_CATEGORIES = ['INFRAESTRUCTURA', 'SEGURIDAD', 'LIMPIEZA'];

// Prioridades disponibles para clasificación por IA
export const AI_REPORT_PRIORITIES = ['ALTA', 'MEDIA', 'BAJA'];

// Prompt completo enviado a Gemini junto con la imagen del reporte
export const GEMINI_ANALYZE_PROMPT = `Eres un inspector municipal de la Ciudad de Guatemala. \
Analiza la imagen proporcionada e identifica el problema urbano que muestra.

Responde ÚNICAMENTE con un objeto JSON válido. No incluyas texto adicional, bloques de código \
markdown (como \`\`\`json), ni explicaciones fuera del JSON.

El objeto JSON debe contener exactamente estos 4 campos:
- "title": string. Título conciso y descriptivo del problema (máximo 150 caracteres). \
Ejemplo: "Bache profundo en calle principal".
- "description": string. Descripción detallada del problema en español \
(entre 10 y 2000 caracteres). Incluye el estado actual, posibles causas y cualquier \
detalle relevante visible en la imagen.
- "category": string. Debe ser exactamente uno de: INFRAESTRUCTURA, SEGURIDAD, LIMPIEZA.
· INFRAESTRUCTURA: baches, pavimento dañado, postes caídos, tuberías rotas, \
puentes deteriorados, señalización vial dañada, infraestructura pública en mal estado.
· SEGURIDAD: alumbrado público dañado o ausente, zonas con visibilidad reducida \
que representen un peligro, obstrucciones en vías de emergencia, riesgos de accidente.
· LIMPIEZA: acumulación de basura, drenajes tapados, aguas residuales expuestas, \
grafiti, escombros en vía pública.
- "priority": string. Debe ser exactamente uno de: ALTA, MEDIA, BAJA.
· ALTA: representa un peligro inmediato para personas o vehículos (ej. bache muy \
profundo en vía principal, poste caído sobre la calzada, inundación activa).
· MEDIA: es urgente pero no supone un peligro inmediato (ej. luminaria apagada, \
drenaje parcialmente bloqueado, acumulación moderada de basura).
· BAJA: problema estético o menor sin riesgo evidente (ej. grafiti en muro, \
pequeña grieta en acera, basura dispersa en zona de bajo tránsito).

Ejemplo de respuesta esperada:
{"title":"Bache profundo en calle principal","description":"Se observa un bache de \
aproximadamente 40 cm de diámetro y 10 cm de profundidad en el carril derecho. \
Representa un riesgo para vehículos y motociclistas.","category":"INFRAESTRUCTURA",\
"priority":"ALTA"}`;