import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { PaymentControllers } from "./payment.controller";

const router = Router();

router.get(
  "/",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  PaymentControllers.getAllPayments,
);

router.get(
  "/my-payments",
  checkAuth(...Object.values(Role)),
  PaymentControllers.getMyPayments,
);

router.get(
  "/:paymentId",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  PaymentControllers.getSinglePayment,
);

router.post(
  "/init-payment/:quotaId",
  checkAuth(...Object.values(Role)),
  PaymentControllers.initPayment,
);

router.post("/success", PaymentControllers.successPayment);
router.post("/fail", PaymentControllers.failPayment);
router.post("/cancel", PaymentControllers.cancelPayment);
router.get(
  "/invoice/:paymentId",
  checkAuth(...Object.values(Role)),
  PaymentControllers.getInvoiceDownloadUrl,
);
router.post("/validate-payment", PaymentControllers.validatePayment);

router.patch(
  "/:paymentId",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  PaymentControllers.updatePaymentStatus,
);

export const PaymentRoutes = router;
