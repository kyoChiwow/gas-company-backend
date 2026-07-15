/* eslint-disable @typescript-eslint/no-explicit-any */
import { Types } from "mongoose";

export enum PAYMENT_STATUS {
  PAID = "PAID",
  UNPAID = "UNPAID",
  CANCELLED = "CANCELLED",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}

export enum PAYMENT_METHOD {
  SSLCOMMERZ = "sslcommerz",
  COD = "cash_on_delivery",
}

export interface IPayment {
  quota: Types.ObjectId;
  transactionId: string;
  amount: number;
  paymentMethod: PAYMENT_METHOD;
  paymentGatewayData?: any;
  invoiceUrl?: string;
  status: PAYMENT_STATUS;
}