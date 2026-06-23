import bcryptjs from "bcryptjs";
import { envVars } from "../config/env";
import { IAuthProvider, IUser, Role } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";

export const seedSuperAdmin = async () => {
  try {
    const isSuperAdminExist = await User.findOne({
      email: envVars.SUPER_ADMIN_EMAIL,
    });

    if (isSuperAdminExist) {
      console.log("Super admin already exists!");
      return;
    }

    const superAdminPassword = await bcryptjs.hash(
      envVars.SUPER_ADMIN_PASSWORD,
      Number(envVars.BCRYPT_SALT_ROUND),
    );

    const superAdminAuth: IAuthProvider = {
      provider: "credentials",
      providerId: envVars.SUPER_ADMIN_EMAIL,
    };

    const superAdminPayload: IUser = {
      name: "Super Admin",
      role: [Role.SUPER_ADMIN],
      email: envVars.SUPER_ADMIN_EMAIL,
      password: superAdminPassword,
      isVerified: true,
      auths: [superAdminAuth],
    };

    const superAdmin = await User.create(superAdminPayload);

    console.log(superAdmin, "Super admin created successfully!");
  } catch (error) {
    console.log(error);
  }
};
