import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { QuotaControllers } from "./quota.controller";

const router = Router();

router.post(
  "/create",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.USER),
  QuotaControllers.createQuota,
);

router.get(
  "/",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.USER),
  QuotaControllers.getAllQuotas,
);

router.get(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.USER),
  QuotaControllers.getSingleQuota,
);

router.patch(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.USER),
  QuotaControllers.updateQuota,
);

router.patch(
  "/delete/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.USER),
  QuotaControllers.deleteQuota,
);

export const QuotaRoutes = router;
