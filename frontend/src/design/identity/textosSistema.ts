export const textosSistema = {
  general: {
    sistema: 'Sistema de gestión urbana',
    estadoBase: 'Base frontend lista',
    preparadoPara:
      'La estructura visual está preparada para conectar autenticación, reportes y gestión operativa en los próximos sprints.'
  },
  autenticacion: {
    tituloLogin: 'Ingresar a Ciudad Activa',
    descripcionLogin:
      'Accede para reportar problemas urbanos, dar seguimiento a tus casos o gestionar incidencias según tu rol.',
    tituloRegistro: 'Crear cuenta ciudadana',
    descripcionRegistro:
      'Regístrate para reportar incidencias urbanas y consultar el avance de tus reportes.'
  },
  navegacion: {
    dashboard: 'Dashboard',
    reportes: 'Reportes urbanos',
    misReportes: 'Mis reportes',
    crearReporte: 'Crear reporte',
    notificaciones: 'Notificaciones',
    usuarios: 'Usuarios',
    perfil: 'Perfil'
  },
  reportes: {
    tituloMapa: 'Reportes urbanos',
    descripcionMapa:
      'Visualiza, filtra y atiende incidencias reportadas por la ciudadanía en el territorio.',
    tituloCrear: 'Crear reporte',
    descripcionCrear:
      'Registra un nuevo problema urbano mediante un flujo guiado por pasos.',
    tituloMisReportes: 'Mis reportes',
    descripcionMisReportes:
      'Consulta el estado actual y seguimiento de los reportes que has enviado.'
  },
  dashboard: {
    titulo: 'Dashboard',
    descripcion: 'Estado general de reportes urbanos e indicadores operativos.'
  }
} as const;