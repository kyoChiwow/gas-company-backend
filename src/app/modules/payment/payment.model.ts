import { model, Schema } from "mongoose";
import { IPayment, PAYMENT_STATUS, PAYMENT_METHOD } from "./payment.interface";

const paymentSchema = new Schema<IPayment>(
  {
    quota: { type: Schema.Types.ObjectId, ref: "Quota", required: true, unique: true },
    transactionId: { type: String, required: true, unique: true },
    status: { type: String, enum: Object.values(PAYMENT_STATUS), default: PAYMENT_STATUS.UNPAID },
    paymentMethod: { type: String, enum: Object.values(PAYMENT_METHOD), required: true },
    amount: { type: Number, required: true },
    paymentGatewayData: { type: Schema.Types.Mixed },
    invoiceUrl: { type: String },
  },
  { timestamps: true },
);

export const Payment = model<IPayment>("Payment", paymentSchema);