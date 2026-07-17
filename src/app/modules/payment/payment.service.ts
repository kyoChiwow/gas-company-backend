/* eslint-disable @typescript-eslint/no-explicit-any */
import { JwtPayload } from "jsonwebtoken";
import AppError from "../../errorHelpers/appError";
import { generatePdf, IInvoiceData } from "../../utils/invoice";
import { sendEmail } from "../../utils/sendEmail";
import { QUOTA_PAYMENT_STATUS } from "../quota/quota.interface";
import { Quota } from "../quota/quota.model";
import { IProduct } from "../product/product.interface";
import { IUser } from "../user/user.interface";
import { PAYMENT_STATUS, PAYMENT_METHOD } from "./payment.interface";
import { Payment } from "./payment.model";
import httpStatus from "http-status-codes";
import mongoose from "mongoose";
import { uploadPdfBufferToCloudinary } from "../../utils/uploadCloudinaryBuffer";
import { ISSLCommerz } from "../sslcommerz/sslcommerz.interface";
import { SSLServices } from "../sslcommerz/sslCommerz.service";

const finalizePaymentAndQuota = async (
  paymentId: string,
  quotaId: string,
  targetPaymentStatus: PAYMENT_STATUS,
  targetQuotaPaymentStatus: QUOTA_PAYMENT_STATUS,
  session: mongoose.ClientSession
) => {
  // 1. Update Payment status to the specified target state
  const updatedPayment = await Payment.findByIdAndUpdate(
    paymentId,
    { status: targetPaymentStatus },
    { new: true, runValidators: true, session }
  );

  // 2. Update Quota status and map paymentId reference
  const updatedQuota = await Quota.findByIdAndUpdate(
    quotaId,
    { 
      paymentStatus: targetQuotaPaymentStatus,
      paymentId: new mongoose.Types.ObjectId(paymentId)
    },
    { new: true, runValidators: true, session }
  ).populate("productId").populate("userId");

  if (!updatedQuota) {
    throw new AppError(httpStatus.NOT_FOUND, "Quota request not found!");
  }
  if (!updatedPayment) {
    throw new AppError(httpStatus.NOT_FOUND, "Payment details not found!");
  }

  // 3. Formulate Invoice Payload with Product Details
  const productInfo = updatedQuota.productId as unknown as IProduct;
  const userInfo = updatedQuota.userId as unknown as IUser;

  const invoiceData: IInvoiceData = {
    transactionId: updatedPayment.transactionId,
    quotaDate: updatedQuota.createdAt as Date,
    userName: userInfo?.name || "Customer",
    productName: productInfo?.name || "Gas Product",
    volume: updatedQuota.volume || "N/A",
    cylinderOrRefill: updatedQuota.cylinderOrRefill ? "Cylinder + Gas" : "Refill Only",
    totalAmount: updatedPayment.amount,
  };

  // 4. Create invoice PDF
  const pdfBuffer = await generatePdf(invoiceData);
  const cloudinaryResult = await uploadPdfBufferToCloudinary(pdfBuffer, "invoice");

  if (!cloudinaryResult) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to upload invoice PDF!");
  }

  // 5. Update Payment with secure invoice URL
  await Payment.findByIdAndUpdate(
    updatedPayment._id,
    { invoiceUrl: cloudinaryResult.secure_url },
    { runValidators: true, session }
  );

  // 6. Send receipt confirmation email
  const isPaid = targetPaymentStatus === PAYMENT_STATUS.PAID;
  await sendEmail({
    to: userInfo?.email,
    subject: isPaid
      ? `Payment Receipt - ${updatedPayment.transactionId}`
      : `Order Confirmation (Cash on Delivery) - ${updatedPayment.transactionId}`,
    templateName: "invoice",
    templateData: invoiceData,
    attachments: [{
      filename: `invoice-${updatedPayment.transactionId}.pdf`,
      content: pdfBuffer,
      contentType: "application/pdf"
    }]
  });

  return { updatedPayment, updatedQuota };
};

const initPaymentService = async (quotaId: string, paymentMethod: PAYMENT_METHOD, amount: number) => {
  // Verify that the Quota request exists
  const quota = await Quota.findById(quotaId).populate("userId");
  if (!quota) {
    throw new AppError(httpStatus.NOT_FOUND, "Quota not found!");
  }

  // Check if a payment record already exists for this Quota
  let payment = await Payment.findOne({ quota: quotaId });

  const internalTxnId = payment?.transactionId || `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

  if (!payment) {
    payment = await Payment.create({
      quota: quota._id,
      transactionId: internalTxnId,
      amount,
      paymentMethod,
      status: PAYMENT_STATUS.UNPAID,
    });
  } else {
    // If it exists, update the payment method and amount in case of changes
    payment.paymentMethod = paymentMethod;
    payment.amount = amount;
    await payment.save();
  }

  const userInfo = quota.userId as any;

  // Case A: Cash On Delivery (COD)
  if (paymentMethod === PAYMENT_METHOD.COD) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // For COD: keeps status UNPAID on the Payment record and PENDING on the Quota request
      await finalizePaymentAndQuota(
        payment._id.toString(), 
        quota._id.toString(), 
        PAYMENT_STATUS.UNPAID, 
        QUOTA_PAYMENT_STATUS.PENDING, 
        session
      );
      
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

  // Case B: SSLCommerz Digital Payment
  if (paymentMethod === PAYMENT_METHOD.SSLCOMMERZ) {
    const sslPayload: ISSLCommerz = {
      address: quota.address || userInfo?.address || "Dhaka, Bangladesh",
      email: userInfo?.email,
      phoneNumber: userInfo?.phone || "N/A",
      name: userInfo?.name,
      amount,
      transactionId: internalTxnId,
    };

    const sslPayment = await SSLServices.sslPaymentInit(sslPayload);

    return {
      paymentMethod: PAYMENT_METHOD.SSLCOMMERZ,
      status: "success",
      paymentUrl: sslPayment?.GatewayPageURL
    };
  }

  throw new AppError(httpStatus.BAD_REQUEST, "Unsupported payment method provided.");
};

const successPaymentService = async (query: Record<string, string>) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const payment = await Payment.findOne({ transactionId: query.transactionId });
    if (!payment) {
      throw new AppError(httpStatus.NOT_FOUND, "Payment record not found!");
    }

    // Online payment success: marks both elements as PAID
    await finalizePaymentAndQuota(
      payment._id.toString(), 
      payment.quota.toString(), 
      PAYMENT_STATUS.PAID, 
      QUOTA_PAYMENT_STATUS.PAID, 
      session
    );

    await session.commitTransaction();
    session.endSession();

    return {
      success: true,
      message: "Online payment successful!"
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

    await Quota.findByIdAndUpdate(
      updatedPayment?.quota,
      { paymentStatus: QUOTA_PAYMENT_STATUS.FAILED },
      { runValidators: true, session },
    );

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

    await Quota.findByIdAndUpdate(
      updatedPayment?.quota,
      { paymentStatus: QUOTA_PAYMENT_STATUS.PENDING },
      { runValidators: true, session },
    );

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
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid token credentials.");
  }

  const payment = await Payment.findById(paymentId).orFail(new AppError(httpStatus.NOT_FOUND, "Payment records not found."));
  const quota = await Quota.findById(payment.quota).orFail(new AppError(httpStatus.NOT_FOUND, "Quota entry mismatch."));

  if (quota.userId?.toString() !== user) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized permission check.");
  }

  if (!payment.invoiceUrl) {
    return {
      success: false,
      message: "Invoice not generated yet.",
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