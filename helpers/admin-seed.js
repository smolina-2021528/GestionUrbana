import { sequelize } from '../configs/db.js';
import { User, UserProfile, UserEmail, UserPasswordReset } from '../src/users/user.model.js';
import { Role, UserRole } from '../src/auth/role.model.js';
import { ADMIN_ROLE } from './role-constants.js';
import { hashPassword } from '../utils/password-utils.js';

const ADMIN_NAME     = process.env.ADMIN_NAME     || 'Admin';
const ADMIN_SURNAME  = process.env.ADMIN_SURNAME  || 'Sistema';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    || 'admin@gestionurbana.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin1234!';
const ADMIN_PHONE    = process.env.ADMIN_PHONE    || '55550000';

// Crea el usuario administrador por defecto si no existe en la base de datos
export const seedAdmin = async () => {
  const t = await sequelize.transaction();
  try {
    const existing = await User.findOne({
      where: { Email: ADMIN_EMAIL.toLowerCase() },
      transaction: t,
    });

    if (existing) {
      await t.rollback();
      console.log(`Admin seed | Administrador ya existe: ${ADMIN_EMAIL}`);
      return;
    }

    const hashedPassword = await hashPassword(ADMIN_PASSWORD);

    const admin = await User.create(
      {
        Name:     ADMIN_NAME,
        Surname:  ADMIN_SURNAME,
        Username: ADMIN_USERNAME.toLowerCase(),
        Email:    ADMIN_EMAIL.toLowerCase(),
        Password: hashedPassword,
        Status:   true, // El admin está activo desde el inicio, sin necesidad de verificar email
      },
      { transaction: t }
    );

    await UserProfile.create(
      { UserId: admin.Id, Phone: ADMIN_PHONE, ProfilePicture: '' },
      { transaction: t }
    );

    // El admin tiene email verificado por defecto
    await UserEmail.create(
      { UserId: admin.Id, EmailVerified: true },
      { transaction: t }
    );

    await UserPasswordReset.create(
      { UserId: admin.Id },
      { transaction: t }
    );

    const adminRole = await Role.findOne({ where: { Name: ADMIN_ROLE } }, { transaction: t });
    if (!adminRole) throw new Error(`El rol ${ADMIN_ROLE} no existe. Asegúrate de ejecutar seedRoles primero.`);

    await UserRole.create(
      { UserId: admin.Id, RoleId: adminRole.Id },
      { transaction: t }
    );

    await t.commit();

    console.log('Admin seed | Administrador por defecto creado exitosamente');
    console.log(`Admin seed | Email:    ${ADMIN_EMAIL}`);
    console.log(`Admin seed | Username: ${ADMIN_USERNAME}`);
    console.log(`Admin seed | Password: ${ADMIN_PASSWORD}`);
    console.log('Admin seed | ⚠️  Cambia estas credenciales en producción (.env)');
  } catch (error) {
    if (t && !t.finished) await t.rollback();
    console.error('Admin seed | Error creando administrador:', error.message);
  }
};
