import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { ProductControllers } from "./product.controller";
import { csvUpload } from "../../middlewares/csvUpload";

const router = Router();

router.post(
  "/create",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  ProductControllers.createProduct,
);

router.post(
  "/create-many/csv",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  csvUpload.single("file"),
  ProductControllers.createProductsFromCSV,
);

router.get("/", ProductControllers.getAllProducts);

router.get("/:id", ProductControllers.getSingleProduct);

router.patch(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  ProductControllers.updateProduct,
);

router.delete(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  ProductControllers.deleteProduct,
);

export const ProductRoutes = router;