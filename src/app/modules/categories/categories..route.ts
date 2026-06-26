import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { CategoriesControllers } from "./categories.controller";

const router = Router();

router.post(
  "/create",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  CategoriesControllers.createCategories,
);

router.get(
  "/",
  CategoriesControllers.getAllCategories,
);

router.get(
  "/:id",
  CategoriesControllers.getSingleCategories,
);

router.patch(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  CategoriesControllers.updateCategories,
);

router.delete(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  CategoriesControllers.deleteCategories,
);

export const CategoriesRoutes = router;