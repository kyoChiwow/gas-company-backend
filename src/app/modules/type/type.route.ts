import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { TypeControllers } from "./type.controller";

const router = Router();

router.post(
  "/create",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  TypeControllers.createType,
);

router.get(
  "/",
  TypeControllers.getAllType,
);

router.get(
  "/:id",
  TypeControllers.getSingleType,
);

router.patch(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  TypeControllers.updateType,
);

router.delete(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  TypeControllers.deleteType,
);

export const TypeRoutes = router;