import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchASync";
import { sendResponse } from "../../utils/sendResponse";
import { OtpServices } from "./otp.service";

const sendOTP = catchAsync(async (req: Request, res: Response) => {
  const { email, name } = req.body;
  await OtpServices.sendOTPService(email, name);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "OTP sent successfully",
    data: null,
  });
});

const verifyOTP = catchAsync(async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  await OtpServices.verifyOTPService(email, otp);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "OTP verified successfully",
    data: null,
  });
});

export const OtpController = {
  sendOTP,
  verifyOTP,
};
