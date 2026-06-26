import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { BrandControllers } from "./brand.controller";

const router = Router();

router.post(
  "/create",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  BrandControllers.createBrand,
);

router.get(
  "/",
  BrandControllers.getAllBrand,
);

router.get(
  "/:id",
  BrandControllers.getSingleBrand,
);

router.patch(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  BrandControllers.updateBrand,
);

router.delete(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  BrandControllers.deleteBrand,
);

export const BrandRoutes = router;