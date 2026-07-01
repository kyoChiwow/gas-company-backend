import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { UserControllers } from "./user.controller";
import { Role } from "./user.interface";
import { createUserZodSchema } from "./user.validation";

const router = Router();

router.post(
  "/register",
  validateRequest(createUserZodSchema),
  UserControllers.createUser,
);

router.get(
  "/get-all",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  UserControllers.getAllUsers,
);

router.get("/get-me", checkAuth(...Object.values(Role)), UserControllers.getMe);

router.patch(
  "/:id/delete",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  UserControllers.deleteUser,
);

router.patch(
  "/:id/restore",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  UserControllers.restoreUser,
);

router.patch(
  "/:id/make-admin",
  checkAuth(Role.SUPER_ADMIN),
  UserControllers.makeUserAdmin,
);

router.patch(
  "/:id/make-super-admin",
  checkAuth(Role.SUPER_ADMIN),
  UserControllers.makeUserSuperAdmin,
);

router.patch(
  "/:id/make-user",
  checkAuth(Role.SUPER_ADMIN),
  UserControllers.makeUser,
);

router.get(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  UserControllers.getSingleUser,
);
router.patch(
  "/:id",
  checkAuth(...Object.values(Role)),
  UserControllers.updateUser,
);

export const UserRoutes = router;
