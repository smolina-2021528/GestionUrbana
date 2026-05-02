import swaggerJSDoc from 'swagger-jsdoc';

const PORT = process.env.AUTH_PORT || process.env.PORT || 3006;

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Gestión Urbana Inteligente - Auth Service',
      version: '1.0.0',
      description: 'Documentación del microservicio de autenticación, usuarios, roles y perfiles.',
    },
    servers: [
      {
        url: `http://localhost:${PORT}/gestionurbana/v1`,
        description: 'Servidor local Auth Service',
      },
    ],
    tags: [
      {
        name: 'Health',
        description: 'Estado del servicio',
      },
      {
        name: 'Auth',
        description: 'Autenticación y sesión',
      },
      {
        name: 'Users',
        description: 'Administración de usuarios',
      },
      {
        name: 'Profile',
        description: 'Perfil del usuario autenticado',
      },
    ],
    paths: {
      '/health': {
        get: {
          tags: ['Health'],
          summary: 'Verificar estado del auth-service',
          responses: {
            200: {
              description: 'Servicio funcionando correctamente',
            },
          },
        },
      },
      '/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Registrar usuario',
          responses: {
            201: {
              description: 'Usuario registrado correctamente',
            },
          },
        },
      },
      '/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Iniciar sesión',
          responses: {
            200: {
              description: 'Login exitoso',
            },
          },
        },
      },
      '/auth/logout': {
        post: {
          tags: ['Auth'],
          summary: 'Cerrar sesión',
          responses: {
            200: {
              description: 'Logout exitoso',
            },
          },
        },
      },
      '/auth/profile': {
        get: {
          tags: ['Auth'],
          summary: 'Obtener perfil autenticado',
          responses: {
            200: {
              description: 'Perfil obtenido correctamente',
            },
          },
        },
      },
      '/users': {
        get: {
          tags: ['Users'],
          summary: 'Listar usuarios',
          responses: {
            200: {
              description: 'Listado de usuarios',
            },
          },
        },
      },
      '/profile': {
        put: {
          tags: ['Profile'],
          summary: 'Actualizar perfil propio',
          responses: {
            200: {
              description: 'Perfil actualizado correctamente',
            },
          },
        },
      },
      '/profile/change-password': {
        put: {
          tags: ['Profile'],
          summary: 'Cambiar contraseña',
          responses: {
            200: {
              description: 'Contraseña actualizada correctamente',
            },
          },
        },
      },
    },
  },
  apis: [],
});