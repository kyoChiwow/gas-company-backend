import httpStatus from "http-status-codes";
import AppError from "../errorHelpers/appError";
import { Role } from "../modules/user/user.interface";
import { JwtPayload } from "jsonwebtoken";
import { Types } from "mongoose";

export const manageUser = (
  decodedToken: JwtPayload,
  targetUser: {
    _id: Types.ObjectId;
    role: Role[];
  },
) => {
  // Admin cannot manage Super Admins
  if (
    decodedToken.role.includes(Role.ADMIN) &&
    targetUser.role.includes(Role.SUPER_ADMIN)
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Admins cannot manage Super Admin accounts.",
    );
  }

  // Super Admin cannot manage themselves
  if (
    decodedToken.role.includes(Role.SUPER_ADMIN) &&
    decodedToken.userId === targetUser._id.toString()
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You cannot modify your own Super Admin account.",
    );
  }
};