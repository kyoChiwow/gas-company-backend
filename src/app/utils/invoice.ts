/* eslint-disable @typescript-eslint/no-explicit-any */
import PDFDocument from "pdfkit";
import AppError from "../errorHelpers/appError";

export interface IInvoiceData {
  transactionId: string;
  quotaDate: Date;
  userName: string;
  productName: string;
  volume: string;
  cylinderOrRefill: string;
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
        .fillColor("#28a745") // Gas theme color (Green)
        .fontSize(25)
        .text("QUOTA PAYMENT INVOICE", { align: "right" });
      doc
        .fillColor("#444444")
        .fontSize(10)
        .text(`Transaction ID: ${invoiceData.transactionId}`, {
          align: "right",
        });
      doc.moveDown();

      // Horizontal line
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
        `Date: ${new Date(invoiceData.quotaDate).toLocaleDateString()}`,
      );
      doc.moveDown(2);

      // --- Bill Specifications Table ---
      const tableTop = 200;
      doc.font("Helvetica-Bold").text("Item Description", 50, tableTop);
      doc.text("Volume", 280, tableTop);
      doc.text("Type", 380, tableTop);
      doc.text("Total (BDT)", 480, tableTop);

      doc
        .moveTo(50, tableTop + 15)
        .lineTo(550, tableTop + 15)
        .strokeColor("#28a745")
        .stroke();

      doc.font("Helvetica").text(invoiceData.productName, 50, tableTop + 25);
      doc.text(invoiceData.volume, 280, tableTop + 25);
      doc.text(invoiceData.cylinderOrRefill, 380, tableTop + 25);
      doc
        .font("Helvetica-Bold")
        .text(`${invoiceData.totalAmount.toFixed(2)}`, 480, tableTop + 25);

      // --- Footer ---
      doc.moveDown(10);
      doc.fontSize(10).font("Helvetica-Oblique").fillColor("#777777");
      doc.text("Thank you for choosing our energy service!", 50, doc.y + 100, {
        align: "center",
        width: 500,
      });

      doc.end();
    });
  } catch (error: any) {
    throw new AppError(500, `PDF generation failed: ${error.message}`);
  }
};