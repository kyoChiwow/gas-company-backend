/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchASync";
import { sendResponse } from "../../utils/sendResponse";
import { QuotaServices } from "./quota.service";
import { JwtPayload } from "jsonwebtoken";

const createQuota = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as any; 

  const result = await QuotaServices.createQuotaService({
    ...req.body,
    userId: user?.userId
  });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Quota created successfully!",
    data: result,
  });
});

const getAllQuotas = catchAsync(async (req: Request, res: Response) => {
  const result = await QuotaServices.getAllQuotasService(
    req.query as Record<string, string>,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Quotas retrieved successfully!",
    data: result.data,
    meta: result.meta,
  });
});

const getSingleQuota = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await QuotaServices.getSingleQuotaService(id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Quota retrieved successfully!",
    data: result,
  });
});

const updateQuota = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await QuotaServices.updateQuotaService(
    id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Quota updated successfully!",
    data: result,
  });
});

const deleteQuota = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  await QuotaServices.deleteQuotaService(id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Quota deleted successfully!",
    data: null,
  });
});

const getMyQuotas = catchAsync(async (req: Request, res: Response) => {
  const decodedToken = req.user as JwtPayload;

  const result = await QuotaServices.getMyQuotasService(
    decodedToken,
    req.query as Record<string, string>
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Your personal quota entries retrieved successfully!",
    data: result.data,
    meta: result.meta,
  });
});

export const QuotaControllers = {
  createQuota,
  getAllQuotas,
  getSingleQuota,
  updateQuota,
  deleteQuota,
  getMyQuotas
};