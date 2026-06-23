/* eslint-disable @typescript-eslint/no-explicit-any */
import bcryptjs from 'bcryptjs';
import httpStatus from 'http-status-codes';
import AppError from "../../errorHelpers/appError";
import { IAuthProvider, IUser, Role } from "./user.interface";
import { User } from "./user.model";
import { envVars } from '../../config/env';
import { OtpServices } from '../otp/otp.service';
import { QueryBuilder } from '../../utils/queryBuilder';
import { userSearchableFields } from './user.constants';
import { JwtPayload } from 'jsonwebtoken';

const createUserService = async (payload: Partial<IUser>) => {
  const { email, password, ...rest } = payload;

  const session = await User.startSession();
  session.startTransaction();

  try {
    const isUserExist = await User.findOne({ email }).session(session);
    if (isUserExist) {
      throw new AppError(httpStatus.BAD_REQUEST, "User already exist");
    }

    const hashedPassword = await bcryptjs.hash(
      password as string,
      Number(envVars.BCRYPT_SALT_ROUND),
    );

    const authProvider: IAuthProvider = {
      provider: "credentials",
      providerId: email as string,
    };

    const [user] = await User.create(
      [
        {
          email,
          password: hashedPassword,
          auths: [authProvider],
          ...rest,
        },
      ],
      { session },
    );

    await OtpServices.sendOTPService(user.email, user.name, session);

    await session.commitTransaction();
    await session.endSession();

    return user;
  } catch (error: any) {
    await session.abortTransaction();
    await session.endSession();

    throw new AppError(500, "Something went wrong!", error);
  }
};

const getAllUsersService = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(User.find(), query);

  const users = await queryBuilder
    .filter()
    .search(userSearchableFields)
    .sort()
    .fields()
    .paginate();

  const [data, meta] = await Promise.all([users.build(), users.getMeta()]);

  return { data, meta };
};

const updateUserService = async (
  userId: string,
  payload: Partial<IUser>,
  decodedToken: JwtPayload,
) => {
  if (
    decodedToken.role === Role.USER ||
    decodedToken.role === Role.COMPANY
  ) {
    if (userId !== decodedToken.userId) {
      throw new AppError(httpStatus.FORBIDDEN, "You are not authorized!");
    }
  }

  const ifUserExists = await User.findById(userId);
  if (!ifUserExists) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!");
  }

  if (
    decodedToken.role === Role.ADMIN &&
    ifUserExists.role.includes(Role.SUPER_ADMIN)
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Admins cannot change the role of super admins!",
    );
  }

  if (payload.role) {
    if (
      decodedToken.role === Role.USER ||
      decodedToken.role === Role.COMPANY
    ) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You are not authorized to change role!",
      );
    }
  }

  if (payload.isActive || payload.isDeleted || payload.isVerified) {
    if (
      decodedToken.role === Role.USER ||
      decodedToken.role === Role.COMPANY
    ) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You are not authorized to change status!",
      );
    }
  }

  const newUpdatedUser = await User.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true,
  });

  return newUpdatedUser;
};

const getSingleUserService = async (userId: string) => {
  const user = await User.findById(userId).select("-password");

  return user;
}

const getMeService = async (userId: string) => {
  const user = await User.findById(userId).select("-password");

  return user;
}

export const UserServices = {
  createUserService,
  getAllUsersService,
  updateUserService,
  getSingleUserService,
  getMeService
};