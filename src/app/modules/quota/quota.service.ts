import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/appError";
import { QueryBuilder } from "../../utils/queryBuilder";
import { PAYMENT_STATUS } from "../payment/payment.interface";
import { Payment } from "../payment/payment.model";
import { IQuota, QUOTA_PAYMENT_STATUS } from "./quota.interface";
import { Quota } from "./quota.model";
import { JwtPayload } from "jsonwebtoken";

const createQuotaService = async (payload: IQuota) => {
  const quota = await Quota.create(payload);

  return quota;
};

const getSingleQuotaService = async (id: string) => {
  const quota = await Quota.findOne({
    _id: id,
    isDeleted: false,
  })
    .populate("userId")
    .populate("productId");

  if (!quota) {
    throw new AppError(httpStatus.NOT_FOUND, "Quota not found!");
  }

  return quota;
};

const getAllQuotasService = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(
    Quota.find({ isDeleted: false }).populate("userId productId"),
    query,
  );

  const quotas = queryBuilder.sort().fields().paginate();

  const [data, meta] = await Promise.all([quotas.build(), quotas.getMeta()]);

  return {
    data,
    meta,
  };
};

const updateQuotaService = async (id: string, payload: Partial<IQuota>) => {
  const quota = await Quota.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!quota) {
    throw new AppError(httpStatus.NOT_FOUND, "Quota not found!");
  }

  const updatedQuota = await Quota.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  return updatedQuota;
};

const deleteQuotaService = async (id: string) => {
  const quota = await Quota.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!quota) {
    throw new AppError(httpStatus.NOT_FOUND, "Quota not found!");
  }

  // 2. SAFETY CHECK: Prevent users from erasing paid history
  if (quota.paymentStatus === QUOTA_PAYMENT_STATUS.PAID) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Cannot delete a quota that has already been paid! Please contact administration for a refund.",
    );
  }

  const session = await Quota.startSession();
  session.startTransaction();

  try {
    // Soft delete the Quota
    await Quota.findByIdAndUpdate(id, { isDeleted: true }, { session });

    // Cancel the payment tracking record alongside it
    await Payment.findOneAndUpdate(
      { quota: id },
      { status: PAYMENT_STATUS.CANCELLED },
      { session },
    );

    await session.commitTransaction();
    session.endSession();
    return null;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const getMyQuotasService = async (
  decodedToken: JwtPayload,
  query: Record<string, string>
) => {
  const userId = decodedToken.userId;
  if (!userId) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid token credentials.");
  }

  // Restrict queries strictly to this user's active records
  const queryBuilder = new QueryBuilder(
    Quota.find({ userId, isDeleted: false }).populate("userId productId"),
    query,
  );

  const quotas = queryBuilder.sort().fields().paginate();

  const [data, meta] = await Promise.all([quotas.build(), quotas.getMeta()]);

  return {
    data,
    meta,
  };
};

export const QuotaServices = {
  createQuotaService,
  getAllQuotasService,
  getSingleQuotaService,
  updateQuotaService,
  deleteQuotaService,
  getMyQuotasService
};
