import { Types } from "mongoose";

export enum QUOTA_PAYMENT_STATUS {
  PENDING = "PENDING",
  PAID = "PAID",
  FAILED = "FAILED",
}

export interface IQuota {
  _id?: string;
  userId?: Types.ObjectId;
  productId?: Types.ObjectId;
  cylinderOrRefill?: boolean;
  volume?: string;
  requirements?: string;
  address?: string;
  isDeleted?: boolean;
  isClosed?: boolean;
  paymentStatus?: QUOTA_PAYMENT_STATUS;
  paymentId?: Types.ObjectId;
}
