import { model, Schema } from "mongoose";
import { IQuota } from "./quota.interface";

const quotaSchema = new Schema<IQuota>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    productId: { type: Schema.Types.ObjectId, ref: "Product" },
    cylinderOrRefill: { type: Boolean, default: false },
    volume: { type: String },
    requirements: { type: String },
    address: { type: String },
    isDeleted: { type: Boolean, default: false },
    isClosed: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false },
);

export const Quota = model<IQuota>("Quota", quotaSchema);
