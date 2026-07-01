/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { catchAsync } from "../../utils/catchASync";
import { sendResponse } from "../../utils/sendResponse";
import { UserServices } from "./user.service";

const createUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await UserServices.createUserService(req.body);

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "User created successfully",
      data: result,
    });
  },
);

const getAllUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const result = await UserServices.getAllUsersService(
      query as Record<string, string>,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Users fetched successfully!",
      data: result.data,
      meta: result.meta,
    });
  },
);

const getSingleUser = catchAsync(async (req: Request, res: Response) => {
  const user = req.params.id;
  const result = await UserServices.getSingleUserService(user as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User fetched successfully!",
    data: result,
  });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
  const decodedToken = req.user as JwtPayload;
  const result = await UserServices.getMeService(decodedToken.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Your profile has been retrieved successfully!",
    data: result,
  });
});

const updateUser = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.id;
  const verifiedToken = req.user;
  const payload = req.body;

  const user = await UserServices.updateUserService(
    userId as string,
    payload,
    verifiedToken as JwtPayload,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User updated successfully!",
    data: user,
  });
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const decodedToken = req.user as JwtPayload;

  const user = await UserServices.deleteUserService(id as string, decodedToken);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User deleted successfully!",
    data: user,
  });
});

const restoreUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const decodedToken = req.user as JwtPayload;

  const user = await UserServices.restoreUserService(id as string, decodedToken);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User restored successfully!",
    data: user,
  });
});

const makeUserAdmin = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const decodedToken = req.user as JwtPayload;

  const user = await UserServices.makeUserAdminService(id as string, decodedToken);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User made admin successfully!",
    data: user,
  });
});

const makeUserSuperAdmin = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const decodedToken = req.user as JwtPayload;

  const user = await UserServices.makeUserSuperAdminService(id as string, decodedToken);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User made super admin successfully!",
    data: user,
  });
});

const makeUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const decodedToken = req.user as JwtPayload;

  const user = await UserServices.makeUserService(id as string, decodedToken);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User role changed to user successfully!",
    data: user,
  });
});

export const UserControllers = {
  createUser,
  getAllUsers,
  getSingleUser,
  getMe,
  updateUser,
  deleteUser,
  makeUserAdmin,
  makeUserSuperAdmin,
  makeUser,
  restoreUser,
};
