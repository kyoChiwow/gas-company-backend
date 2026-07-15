/* eslint-disable @typescript-eslint/no-explicit-any */
import { JwtPayload } from "jsonwebtoken";
import AppError from "../../errorHelpers/appError";
import { sendEmail } from "../../utils/sendEmail";
import { Quota } from "../quota/quota.model";
import { IProduct } from "../product/product.interface";
import { IUser } from "../user/user.interface";
import { PAYMENT_STATUS, PAYMENT_METHOD } from "./payment.interface";
import { Payment } from "./payment.model";
import httpStatus from "http-status-codes";
import mongoose from "mongoose";
import { generatePdf, IInvoiceData } from "../../utils/invoice";

// Utility function to complete a Payment and finalize the corresponding Quota status
const finalizeQuotaPayment = async (
  paymentId: string,
  quotaId: string,
  session: mongoose.ClientSession
) => {
  const updatedPayment = await Payment.findByIdAndUpdate(
    paymentId,
    { status: PAYMENT_STATUS.PAID },
    { new: true, runValidators: true, session }
  );

  // Close the Quota once it's fully confirmed/paid
  const updatedQuota = await Quota.findByIdAndUpdate(
    quotaId,
    { isClosed: true },
    { new: true, runValidators: true, session }
  ).populate("productId").populate("userId");

  if (!updatedQuota) {
    throw new AppError(httpStatus.NOT_FOUND, "Quota not found!");
  }
  if (!updatedPayment) {
    throw new AppError(httpStatus.NOT_FOUND, "Payment details missing!");
  }

  // Construct Invoice details representing e-commerce/cylinder data
  const invoiceData: IInvoiceData = {
    bookingDate: updatedQuota?.createdAt as Date,
    guestCount: undefined, // Ignored or set as dynamic/default for products
    totalAmount: updatedPayment?.amount,
    tourTitle: (updatedQuota?.productId as unknown as IProduct)?.name, // Product Name
    transactionId: updatedPayment?.transactionId,
    userName: (updatedQuota?.userId as unknown as IUser)?.name
  };

  const pdfBuffer = await generatePdf(invoiceData);
  const cloudinaryResult = await uploadBufferFromCloudinary(pdfBuffer, "invoice");

  if (!cloudinaryResult) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to upload invoice to Cloudinary!");
  }

  await Payment.findByIdAndUpdate(
    updatedPayment?._id,
    { invoiceUrl: cloudinaryResult?.secure_url },
    { runValidators: true, session }
  );

  await sendEmail({
    to: (updatedQuota?.userId as unknown as IUser)?.email,
    subject: "Quota Invoice Details",
    templateName: "invoice",
    templateData: invoiceData,
    attachments: [{
      filename: "invoice.pdf",
      content: pdfBuffer,
      contentType: "application/pdf"
    }]
  });

  return { updatedPayment, updatedQuota };
};

const initPaymentService = async (
  quotaId: string, 
  paymentMethod: PAYMENT_METHOD,
  amount: number // Required to spawn an internal transaction/payment entry
) => {
  const existingQuota = await Quota.findOne({ _id: quotaId, isDeleted: false }).populate("userId");

  if (!existingQuota) {
    throw new AppError(httpStatus.NOT_FOUND, "Active Quota not found!");
  }

  // Create an unique transactional identifier
  const transactionId = `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

  // 1. Create or overwrite a payment entry for the Quota
  let payment = await Payment.findOne({ quota: quotaId });
  if (payment) {
    payment.paymentMethod = paymentMethod;
    payment.amount = amount;
    payment.transactionId = transactionId;
    await payment.save();
  } else {
    payment = await Payment.create({
      quota: quotaId,
      transactionId,
      amount,
      paymentMethod,
      status: PAYMENT_STATUS.UNPAID
    });
  }

  const user = existingQuota.userId as any;
  const sslPayload: ISSLCommerz = {
    address: existingQuota.address || user.address || "N/A",
    email: user.email,
    phoneNumber: user.phone || "N/A",
    name: user.name,
    amount: payment.amount,
    transactionId: payment.transactionId,
  };

  // Case 1: Cash on Delivery
  if (paymentMethod === PAYMENT_METHOD.COD) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      await finalizeQuotaPayment(payment._id.toString(), existingQuota._id.toString(), session);
      await session.commitTransaction();
      session.endSession();

      return {
        paymentMethod: PAYMENT_METHOD.COD,
        status: "success",
        paymentUrl: null
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  // Case 2: SSLCommerz
  if (paymentMethod === PAYMENT_METHOD.SSLCOMMERZ) {
    const sslPayment = await SSLServices.sslPaymentInit(sslPayload);

    return {
      paymentMethod: PAYMENT_METHOD.SSLCOMMERZ,
      status: "success",
      paymentUrl: sslPayment?.GatewayPageURL
    };
  }

  throw new AppError(httpStatus.BAD_REQUEST, "Selected payment method is invalid!");
};

const successPaymentService = async (query: Record<string, string>) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const payment = await Payment.findOne({ transactionId: query.transactionId });
    if (!payment) {
      throw new AppError(httpStatus.NOT_FOUND, "Transaction records not found!");
    }

    await finalizeQuotaPayment(payment._id.toString(), payment.quota.toString(), session);

    await session.commitTransaction();
    session.endSession();

    return {
      success: true,
      message: "Payment finished successfully!"
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const failPaymentService = async (query: Record<string, string>) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const updatedPayment = await Payment.findOneAndUpdate(
      { transactionId: query.transactionId },
      { status: PAYMENT_STATUS.FAILED },
      { new: true, runValidators: true, session },
    );

    // If payment fails, ensure the quota remains open
    if (updatedPayment) {
      await Quota.findByIdAndUpdate(
        updatedPayment.quota,
        { isClosed: false },
        { runValidators: true, session },
      );
    }

    await session.commitTransaction();
    session.endSession();

    return {
      success: false,
      message: "Payment Failed!"
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const cancelPaymentService = async (query: Record<string, string>) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const updatedPayment = await Payment.findOneAndUpdate(
      { transactionId: query.transactionId },
      { status: PAYMENT_STATUS.CANCELLED },
      { new: true, runValidators: true, session },
    );

    if (updatedPayment) {
      await Quota.findByIdAndUpdate(
        updatedPayment.quota,
        { isClosed: false },
        { runValidators: true, session },
      );
    }

    await session.commitTransaction();
    session.endSession();

    return {
      success: false,
      message: "Payment Cancelled!"
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const getInvoiceDownloadUrlService = async (paymentId: string, decodedToken: JwtPayload) => {
  const user = decodedToken.userId;

  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, "User credentials missing!");
  }

  const quota = await Quota.findOne({ payment: paymentId }).orFail(new Error("Quota linked to payment not found!"));

  if (quota?.userId?.toString() !== user) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized access to invoice!");
  }

  const payment = await Payment.findById(paymentId)
    .select("invoiceUrl").orFail(new Error("Payment not found!"));

  if (!payment.invoiceUrl) {
    return {
      success: false,
      message: "Invoice generation pending!",
      downloadUrl: null
    };
  }

  return payment.invoiceUrl;
};

export const PaymentServices = {
  initPaymentService,
  successPaymentService,
  failPaymentService,
  cancelPaymentService,
  getInvoiceDownloadUrlService
};