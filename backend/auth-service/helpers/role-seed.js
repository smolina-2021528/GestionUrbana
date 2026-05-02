import { Role } from '../src/auth/role.model.js';
import { ALLOWED_ROLES } from './role-constants.js';

// Siembra los roles base del sistema si no existen
export const seedRoles = async () => {
  for (const name of ALLOWED_ROLES) {
    await Role.findOrCreate({
      where: { Name: name },
      defaults: { Name: name },
    });
  }
  console.log('Role seed | Roles verificados/creados correctamente');
};

