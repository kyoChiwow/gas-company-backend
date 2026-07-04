import { Types } from "mongoose";

export interface IQuota {
    _id?: string;
    userId?: Types.ObjectId;
    productId?: Types.ObjectId;
    volume?: string;
    requirements?: string;
    address?: string;
    isDeleted?: boolean;
    isClosed?: boolean;
}