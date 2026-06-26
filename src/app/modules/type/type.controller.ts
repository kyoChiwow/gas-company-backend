import httpStatus from 'http-status-codes';
import { Request, Response } from "express";
import { TypeServices } from "./type.service";
import { catchAsync } from "../../utils/catchASync";
import { sendResponse } from "../../utils/sendResponse";

const createType = catchAsync(async (req: Request, res: Response) => {
  const result = await TypeServices.createTypeService(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Section created successfully!",
    data: result,
  });
});

const getAllType = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;

  const result = await TypeServices.getAllTypeService(
    query as Record<string, string>,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Sections retrieved successfully!",
    data: result.data,
    meta: result.meta,
  });
});

const getSingleType = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await TypeServices.getSingleTypeService(id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Section retrieved successfully!",
    data: result,
  });
});

const updateType = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await TypeServices.updateTypeService(id as string, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Section updated successfully!",
    data: result,
  });
});

const deleteType = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  await TypeServices.deleteTypeService(id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Section deleted successfully!",
    data: null,
  });
});

export const TypeControllers = {
  createType,
  getAllType,
  getSingleType,
  updateType,
  deleteType,
};