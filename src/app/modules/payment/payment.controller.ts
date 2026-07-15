import { Request, Response } from "express";
import { envVars } from "../../config/env";
import { catchAsync } from "../../utils/catchASync";
import { PaymentServices } from "./payment.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { SSLServices } from "../sslcommerz/sslCommerz.service";

const initPayment = catchAsync(async (req: Request, res: Response) => {
  const { quotaId } = req.params;
  const { paymentMethod, amount } = req.body; 

  const result = await PaymentServices.initPaymentService(quotaId as string, paymentMethod, Number(amount));

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.paymentUrl ? "SSLCommerz portal initialized." : "Cash on delivery order confirmed.",
    data: result,
  });
});

const successPayment = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const result = await PaymentServices.successPaymentService(
    query as Record<string, string>,
  );

  if (result.success) {
    res.redirect(
      `${envVars.SSL.SSL_SUCCESS_FRONTEND_URL}?transactionId=${query.transactionId}&message=${result.message}&amount=${query.amount}&status=${query.status}`,
    );
  }
});

const failPayment = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const result = await PaymentServices.failPaymentService(
    query as Record<string, string>,
  );

  if (!result.success) {
    res.redirect(
      `${envVars.SSL.SSL_FAIL_FRONTEND_URL}?transactionId=${query.transactionId}&message=${result.message}&amount=${query.amount}&status=${query.status}`,
    );
  }
});

const cancelPayment = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const result = await PaymentServices.cancelPaymentService(
    query as Record<string, string>,
  );

  if (!result.success) {
    res.redirect(
      `${envVars.SSL.SSL_CANCEL_FRONTEND_URL}?transactionId=${query.transactionId}&message=${result.message}&amount=${query.amount}&status=${query.status}`,
    );
  }
});

const getInvoiceDownloadUrl = catchAsync(async (req: Request, res: Response) => {
  const decodedToken = req.user as JwtPayload;
  const { paymentId } = req.params;
  
  const result = await PaymentServices.getInvoiceDownloadUrlService(paymentId as string, decodedToken);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Invoice retrieved successfully!",
    data: result,
  });
});

const validatePayment = catchAsync(async (req: Request, res: Response) => {
  await SSLServices.validatePayment(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment validated successfully!",
    data: null,
  });
});

export const PaymentControllers = {
  initPayment,
  successPayment,
  failPayment,
  cancelPayment,
  getInvoiceDownloadUrl,
  validatePayment
};