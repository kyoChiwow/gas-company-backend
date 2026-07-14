import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import cloudinary from "../../config/cloudinary";
import { envVars } from "../../config/env";
import { catchAsync } from "../../utils/catchASync";
import { sendResponse } from "../../utils/sendResponse";

const getCloudinarySignature = catchAsync(
  async (req: Request, res: Response) => {
    const timestamp = Math.round(new Date().getTime() / 1000);

    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder: "products",
      },
      envVars.CLOUDINARY.CLOUDINARY_API_SECRET,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Signature generated successfully!",
      data: {
        signature,
        timestamp,
        cloudName: envVars.CLOUDINARY.CLOUDINARY_CLOUD_NAME,
        apiKey: envVars.CLOUDINARY.CLOUDINARY_API_KEY,
      },
    });
  },
);

export const UploadControllers = {
  getCloudinarySignature,
};
