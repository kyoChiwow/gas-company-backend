/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { Readable } from "stream";
import csv from "csv-parser";
import AppError from "../../errorHelpers/appError";
import { catchAsync } from "../../utils/catchASync";
import { sendResponse } from "../../utils/sendResponse";
import { IProductCSVRow } from "./product.interface";
import { ProductServices } from "./product.service";

const createProduct = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductServices.createProductService(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Product created successfully!",
    data: result,
  });
});


const parseCSVBuffer = (buffer: Buffer): Promise<IProductCSVRow[]> => {
  return new Promise((resolve, reject) => {
    const rows: IProductCSVRow[] = [];

    Readable.from(buffer)
      .pipe(csv())
      .on("data", (row: IProductCSVRow) => rows.push(row))
      .on("end", () => resolve(rows))
      .on("error", (error: any) => reject(error));
  });
};

const createProductsFromCSV = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.file) {
      throw new AppError(httpStatus.BAD_REQUEST, "CSV file is required!");
    }

    const rows = await parseCSVBuffer(req.file.buffer);

    const result = await ProductServices.createProductsFromCSVService(rows);

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: `${result.length} product(s) created successfully from CSV!`,
      data: result,
    });
  },
);

const getAllProducts = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;

  const result = await ProductServices.getAllProductsService(
    query as Record<string, string>,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Products retrieved successfully!",
    data: result.data,
    meta: result.meta,
  });
});

const getSingleProduct = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await ProductServices.getSingleProductService(id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product retrieved successfully!",
    data: result,
  });
});

const updateProduct = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await ProductServices.updateProductService(
    id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product updated successfully!",
    data: result,
  });
});

const deleteProduct = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  await ProductServices.deleteProductService(id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product deleted successfully!",
    data: null,
  });
});

export const ProductControllers = {
  createProduct,
  createProductsFromCSV,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
};