const claveBaseUsuarios = ['usuarios'] as const;

export const clavesConsultaUsuarios = {
  todos: claveBaseUsuarios,

  listas: () => [...claveBaseUsuarios, 'listas'] as const,

  porRol: (nombreRol: string) => [...claveBaseUsuarios, 'rol', nombreRol] as const
} as const;