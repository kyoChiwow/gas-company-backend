/* eslint-disable @typescript-eslint/no-explicit-any */
import PDFDocument from "pdfkit";
import AppError from "../errorHelpers/appError";

export interface IInvoiceData {
  transactionId: string;
  bookingDate: Date;
  userName: string;
  tourTitle: string;
  guestCount: number;
  totalAmount: number;
}

export const generatePdf = async (
  invoiceData: IInvoiceData,
): Promise<Buffer> => {
  try {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const buffers: Buffer[] = [];

      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", (err) => reject(err));

      // --- Header ---
      doc
        .fillColor("#007bff")
        .fontSize(25)
        .text("BOOKING INVOICE", { align: "right" });
      doc
        .fillColor("#444444")
        .fontSize(10)
        .text(`Transaction ID: ${invoiceData.transactionId}`, {
          align: "right",
        });
      doc.moveDown();

      // Draw a horizontal line
      doc.moveTo(50, 100).lineTo(550, 100).strokeColor("#eeeeee").stroke();
      doc.moveDown(2);

      // --- Customer Info ---
      doc
        .fillColor("#333333")
        .fontSize(12)
        .font("Helvetica-Bold")
        .text("Billed To:");
      doc.font("Helvetica").text(invoiceData.userName);
      doc.text(
        `Date: ${new Date(invoiceData.bookingDate).toLocaleDateString()}`,
      );
      doc.moveDown(2);

      // --- Booking Details Table-like Layout ---
      const tableTop = 200;
      doc.font("Helvetica-Bold").text("Description", 50, tableTop);
      doc.text("Guests", 350, tableTop);
      doc.text("Total (BDT)", 480, tableTop);

      doc
        .moveTo(50, tableTop + 15)
        .lineTo(550, tableTop + 15)
        .stroke();

      doc.font("Helvetica").text(invoiceData.tourTitle, 50, tableTop + 25);
      doc.text(invoiceData.guestCount.toString(), 350, tableTop + 25);
      doc
        .font("Helvetica-Bold")
        .text(`${invoiceData.totalAmount.toFixed(2)}`, 480, tableTop + 25);

      // --- Footer ---
      doc.moveDown(10);
      doc.fontSize(10).font("Helvetica-Oblique").fillColor("#777777");
      doc.text("Thank you for booking with us!", 50, doc.y, {
        align: "center",
        width: 500,
      });

      doc.end();
    });
  } catch (error: any) {
    console.log(error);
    throw new AppError(401, `PDF creation failed! ${error.message}`);
  }
};
