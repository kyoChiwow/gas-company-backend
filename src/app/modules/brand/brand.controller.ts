import httpStatus from 'http-status-codes';
import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchASync";
import { BrandServices } from "./brand.service";
import { sendResponse } from "../../utils/sendResponse";

const createBrand = catchAsync(async (req: Request, res: Response) => {
  const result = await BrandServices.createBrandService(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Section created successfully!",
    data: result,
  });
});

const getAllBrand = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;

  const result = await BrandServices.getAllBrandService(
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

const getSingleBrand = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await BrandServices.getSingleBrandService(id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Section retrieved successfully!",
    data: result,
  });
});

const updateBrand = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await BrandServices.updateBrandService(id as string, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Section updated successfully!",
    data: result,
  });
});

const deleteBrand = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  await BrandServices.deleteBrandService(id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Section deleted successfully!",
    data: null,
  });
});

export const BrandControllers = {
  createBrand,
  getAllBrand,
  getSingleBrand,
  updateBrand,
  deleteBrand,
};