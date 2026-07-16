import { Router } from "express";
import { PaymentControllers } from "./payment.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";

const router = Router();

router.post("/init-payment/:quotaId", checkAuth(...Object.values(Role)), PaymentControllers.initPayment);

router.post("/success", PaymentControllers.successPayment);
router.post("/fail", PaymentControllers.failPayment);
router.post("/cancel", PaymentControllers.cancelPayment);
router.get("/invoice/:paymentId", checkAuth(...Object.values(Role)), PaymentControllers.getInvoiceDownloadUrl);
router.post("/validate-payment", PaymentControllers.validatePayment);

export const PaymentRoutes = router;