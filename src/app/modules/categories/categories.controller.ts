import httpStatus from 'http-status-codes';
import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchASync";
import { CategoriesServices } from "./categories.service";
import { sendResponse } from "../../utils/sendResponse";

const createCategories = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoriesServices.createCategoriesService(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Section created successfully!",
    data: result,
  });
});

const getAllCategories = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;

  const result = await CategoriesServices.getAllCategoriesService(
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

const getSingleCategories = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await CategoriesServices.getSingleCategoriesService(id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Section retrieved successfully!",
    data: result,
  });
});

const updateCategories = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await CategoriesServices.updateCategoriesService(id as string, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Section updated successfully!",
    data: result,
  });
});

const deleteCategories = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  await CategoriesServices.deleteCategoriesService(id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Section deleted successfully!",
    data: null,
  });
});

export const CategoriesControllers = {
  createCategories,
  getAllCategories,
  getSingleCategories,
  updateCategories,
  deleteCategories
};