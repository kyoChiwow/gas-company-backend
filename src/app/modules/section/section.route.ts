import { Router } from "express";
import { SectionControllers } from "./section.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";

const router = Router();

router.post(
  "/create",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  SectionControllers.createSection,
);

router.get(
  "/",
  SectionControllers.getAllSections,
);

router.get(
  "/:id",
  SectionControllers.getSingleSection,
);

router.patch(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  SectionControllers.updateSection,
);

router.delete(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  SectionControllers.deleteSection,
);

export const SectionRoutes = router;