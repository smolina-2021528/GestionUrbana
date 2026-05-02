import swaggerJSDoc from 'swagger-jsdoc';

const PORT = process.env.REPORT_PORT || process.env.PORT || 3007;

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Gestión Urbana Inteligente - Report Service',
      version: '1.0.0',
      description: 'Documentación del microservicio de reportes, comentarios, estadísticas, IA y notificaciones.',
    },
    servers: [
      {
        url: `http://localhost:${PORT}/gestionurbana/v1`,
        description: 'Servidor local Report Service',
      },
    ],
    tags: [
      {
        name: 'Health',
        description: 'Estado del servicio',
      },
      {
        name: 'Reports',
        description: 'Gestión de reportes urbanos',
      },
      {
        name: 'AI',
        description: 'Análisis de reportes con IA',
      },
      {
        name: 'Comments',
        description: 'Comentarios de reportes',
      },
      {
        name: 'Notifications',
        description: 'Notificaciones del usuario',
      },
      {
        name: 'Stats',
        description: 'Estadísticas y dashboard',
      },
    ],
    paths: {
      '/health': {
        get: {
          tags: ['Health'],
          summary: 'Verificar estado del report-service',
          responses: {
            200: {
              description: 'Servicio funcionando correctamente',
            },
          },
        },
      },
      '/reports': {
        get: {
          tags: ['Reports'],
          summary: 'Listar reportes',
          responses: {
            200: {
              description: 'Listado de reportes',
            },
          },
        },
        post: {
          tags: ['Reports'],
          summary: 'Crear reporte',
          responses: {
            201: {
              description: 'Reporte creado correctamente',
            },
          },
        },
      },
      '/reports/my-reports': {
        get: {
          tags: ['Reports'],
          summary: 'Listar mis reportes',
          responses: {
            200: {
              description: 'Reportes del usuario autenticado',
            },
          },
        },
      },
      '/reports/{reportId}': {
        get: {
          tags: ['Reports'],
          summary: 'Obtener reporte por ID',
          parameters: [
            {
              name: 'reportId',
              in: 'path',
              required: true,
              schema: {
                type: 'string',
              },
            },
          ],
          responses: {
            200: {
              description: 'Reporte encontrado',
            },
          },
        },
        put: {
          tags: ['Reports'],
          summary: 'Actualizar reporte',
          parameters: [
            {
              name: 'reportId',
              in: 'path',
              required: true,
              schema: {
                type: 'string',
              },
            },
          ],
          responses: {
            200: {
              description: 'Reporte actualizado',
            },
          },
        },
        delete: {
          tags: ['Reports'],
          summary: 'Eliminar reporte',
          parameters: [
            {
              name: 'reportId',
              in: 'path',
              required: true,
              schema: {
                type: 'string',
              },
            },
          ],
          responses: {
            200: {
              description: 'Reporte eliminado',
            },
          },
        },
      },
      '/reports/search': {
        get: {
          tags: ['Reports'],
          summary: 'Buscar reportes',
          responses: {
            200: {
              description: 'Resultados de búsqueda',
            },
          },
        },
      },
      '/reports/nearby': {
        get: {
          tags: ['Reports'],
          summary: 'Buscar reportes cercanos',
          responses: {
            200: {
              description: 'Reportes cercanos encontrados',
            },
          },
        },
      },
      '/reports/heatmap': {
        get: {
          tags: ['Reports'],
          summary: 'Obtener mapa de calor',
          responses: {
            200: {
              description: 'Datos de heatmap',
            },
          },
        },
      },
      '/reports/check-duplicates': {
        post: {
          tags: ['Reports'],
          summary: 'Verificar reportes duplicados',
          responses: {
            200: {
              description: 'Resultado de verificación de duplicados',
            },
          },
        },
      },
      '/reports/analyze': {
        post: {
          tags: ['AI'],
          summary: 'Analizar imagen con IA',
          responses: {
            200: {
              description: 'Análisis generado correctamente',
            },
          },
        },
      },
      '/reports/ai-create': {
        post: {
          tags: ['AI'],
          summary: 'Crear reporte asistido por IA',
          responses: {
            201: {
              description: 'Reporte generado con IA',
            },
          },
        },
      },
      '/notifications': {
        get: {
          tags: ['Notifications'],
          summary: 'Obtener mis notificaciones',
          responses: {
            200: {
              description: 'Listado de notificaciones',
            },
          },
        },
      },
      '/stats/dashboard': {
        get: {
          tags: ['Stats'],
          summary: 'Dashboard de estadísticas',
          responses: {
            200: {
              description: 'Métricas principales',
            },
          },
        },
      },
      '/stats/trends': {
        get: {
          tags: ['Stats'],
          summary: 'Tendencias de reportes',
          responses: {
            200: {
              description: 'Serie temporal de reportes',
            },
          },
        },
      },
      '/stats/zones': {
        get: {
          tags: ['Stats'],
          summary: 'Ranking de zonas',
          responses: {
            200: {
              description: 'Ranking de zonas con mayor concentración',
            },
          },
        },
      },
    },
  },
  apis: [],
});