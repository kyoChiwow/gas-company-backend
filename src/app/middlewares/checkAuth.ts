import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../config/env";
import AppError from "../errorHelpers/appError";
import { IsActive } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";
import { verifyToken } from "../utils/jwt";

export const checkAuth =
  (...authRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accessToken = req.headers.authorization || req.cookies.accessToken;

      if (!accessToken) {
        throw new AppError(403, "No Token received!");
      }

      const verifiedToken = verifyToken(
        accessToken,
        envVars.JWT_ACCESS_SECRET,
      ) as JwtPayload;

      if (!verifiedToken) {
        throw new AppError(403, `Invalid Token! ${verifiedToken}`);
      }

      const isUserExist = await User.findOne({ email: verifiedToken.email });

      if (!isUserExist) {
        throw new AppError(httpStatus.NOT_FOUND, "User does not exist!");
      }

      if (!isUserExist.isVerified) {
        throw new AppError(httpStatus.BAD_REQUEST, "User is not verified!");
      }

      if (
        isUserExist.isActive === IsActive.INACTIVE ||
        isUserExist.isActive === IsActive.BLOCKED
      ) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          `User is ${isUserExist.isActive}!`,
        );
      }

      if (isUserExist.isDeleted) {
        throw new AppError(httpStatus.BAD_REQUEST, "User is deleted!");
      }

      console.log("User Roles from Token:", verifiedToken.role);
      console.log("Required Roles for Route:", authRoles);

      const userRoles = verifiedToken.role;
      const hasPermission = userRoles.some((role: string) =>
        authRoles.includes(role),
      );

      if (!hasPermission) {
        throw new AppError(httpStatus.FORBIDDEN, "You are not authorized!");
      }

      req.user = verifiedToken;
      next();
    } catch (error) {
      next(error);
    }
  };
