import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/appError";
import { QueryBuilder } from "../../utils/queryBuilder";
import { IQuota } from "./quota.interface";
import { Quota } from "./quota.model";

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

  const [data, meta] = await Promise.all([
    quotas.build(),
    quotas.getMeta(),
  ]);

  return {
    data,
    meta,
  };
};

const updateQuotaService = async (
  id: string,
  payload: Partial<IQuota>,
) => {
  const quota = await Quota.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!quota) {
    throw new AppError(httpStatus.NOT_FOUND, "Quota not found!");
  }

  const updatedQuota = await Quota.findByIdAndUpdate(
    id,
    payload,
    {
      new: true,
      runValidators: true,
    },
  );

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

  await Quota.findByIdAndUpdate(id, {
    isDeleted: true,
  });

  return null;
};

export const QuotaServices = {
  createQuotaService,
  getAllQuotasService,
  getSingleQuotaService,
  updateQuotaService,
  deleteQuotaService,
};