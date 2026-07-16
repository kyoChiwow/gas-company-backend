import { Router } from "express";
import { OtpController } from "./otp.controller";

const router = Router();

router.post("/send", OtpController.sendOTP);
router.post("/verify", OtpController.verifyOTP);
router.post("/resend", OtpController.resendOTP);

export const OtpRoutes = router;
