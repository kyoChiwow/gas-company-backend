import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../../config/env";
import { catchAsync } from "../../utils/catchASync";
import { sendResponse } from "../../utils/sendResponse";
import { SSLServices } from "../sslcommerz/sslCommerz.service";
import { PaymentServices } from "./payment.service";

const initPayment = catchAsync(async (req: Request, res: Response) => {
  const { quotaId } = req.params;
  const { paymentMethod, amount } = req.body;

  const result = await PaymentServices.initPaymentService(
    quotaId as string,
    paymentMethod,
    Number(amount),
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.paymentUrl
      ? "SSLCommerz portal initialized."
      : "Cash on delivery order confirmed.",
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

const getInvoiceDownloadUrl = catchAsync(
  async (req: Request, res: Response) => {
    const decodedToken = req.user as JwtPayload;
    const { paymentId } = req.params;

    const result = await PaymentServices.getInvoiceDownloadUrlService(
      paymentId as string,
      decodedToken,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Invoice retrieved successfully!",
      data: result,
    });
  },
);

const validatePayment = catchAsync(async (req: Request, res: Response) => {
  await SSLServices.validatePayment(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment validated successfully!",
    data: null,
  });
});

const getAllPayments = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentServices.getAllPaymentsService(
    req.query as Record<string, string>,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payments retrieved successfully!",
    data: result.data,
    meta: result.meta,
  });
});

const updatePaymentStatus = catchAsync(async (req: Request, res: Response) => {
  const { paymentId } = req.params;
  const result = await PaymentServices.updatePaymentStatusService(
    paymentId as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment status updated and synchronized successfully!",
    data: result,
  });
});

export const PaymentControllers = {
  initPayment,
  successPayment,
  failPayment,
  cancelPayment,
  getInvoiceDownloadUrl,
  validatePayment,
  getAllPayments,
  updatePaymentStatus,
};
