import crypto from "crypto";
import { ClientSession } from "mongoose";
import AppError from "../../errorHelpers/appError";
import { sendEmail } from "../../utils/sendEmail";
import { User } from "../user/user.model";
import { redisClient } from "../../config/redis.config";

const OTP_EXPIRATION = 2 * 60;

const generateOTP = (length = 6) => {
  const otp = crypto.randomInt(10 ** (length - 1), 10 ** length).toString();
  return otp;
};

const sendOTPService = async (
  email: string,
  name: string,
  session?: ClientSession,
) => {
  const user = await User.findOne({ email }).session(session as ClientSession);

  if (!user) {
    throw new AppError(401, "User not found!");
  }
  if (user?.isVerified) {
    throw new AppError(401, "You are already verified!");
  }

  const otp = generateOTP();
  const redisKey = `otp:${email}`;

  await redisClient.set(redisKey, otp, {
    expiration: {
      type: "EX",
      value: OTP_EXPIRATION,
    },
  });

  await sendEmail({
    to: email,
    subject: "OTP Verification",
    templateName: "otp",
    templateData: {
      name,
      otp,
    },
  });
};

const verifyOTPService = async (email: string, otp: string) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError(401, "User not found!");
  }
  if (user?.isVerified) {
    throw new AppError(401, "You are already verified!");
  }

  const redisKey = `otp:${email}`;
  const storedOTP = await redisClient.get(redisKey);

  if (!storedOTP) {
    throw new AppError(401, "OTP expired!");
  }
  if (storedOTP !== otp) {
    throw new AppError(401, "Invalid OTP!");
  }

  await Promise.all([
    User.updateOne({ email }, { isVerified: true }, { runValidators: true }),
    redisClient.del([redisKey]),
  ]);
};

export const OtpServices = {
  sendOTPService,
  verifyOTPService,
};
