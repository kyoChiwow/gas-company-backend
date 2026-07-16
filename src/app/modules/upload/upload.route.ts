import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { UploadControllers } from "./upload.controller";

const router = Router();

router.get(
  "/signature",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  UploadControllers.getCloudinarySignature,
);

export const UploadRoutes = router;
