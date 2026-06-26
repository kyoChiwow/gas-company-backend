import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchASync";
import { sendResponse } from "../../utils/sendResponse";
import { SectionServices } from "./section.service";

const createSection = catchAsync(async (req: Request, res: Response) => {
  const result = await SectionServices.createSectionService(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Section created successfully!",
    data: result,
  });
});

const getAllSections = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;

  const result = await SectionServices.getAllSectionsService(
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

const getSingleSection = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await SectionServices.getSingleSectionService(id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Section retrieved successfully!",
    data: result,
  });
});

const updateSection = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await SectionServices.updateSectionService(id as string, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Section updated successfully!",
    data: result,
  });
});

const deleteSection = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  await SectionServices.deleteSectionService(id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Section deleted successfully!",
    data: null,
  });
});

export const SectionControllers = {
  createSection,
  getAllSections,
  getSingleSection,
  updateSection,
  deleteSection,
};