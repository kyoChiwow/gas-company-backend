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
      // 1. Initialize modern A4 frame dimensions
      const doc = new PDFDocument({ size: "A4", margin: 45 });
      const buffers: Buffer[] = [];

      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", (err) => reject(err));

      // --- BRAND COLOR ACCENTS ---
      const slateDark = "#0F172A";
      const slateMedium = "#475569";
      const slateLight = "#94A3B8";
      const borderGray = "#E2E8F0";
      const bgLight = "#F8FAFC";
      const orangeAccent = "#EA580C";

      // --- HEADER BLOCK ---
      // Brand Identity
      doc
        .fillColor(slateDark)
        .font("Helvetica-Bold")
        .fontSize(22)
        .text("Taher Enterprise", 45, 50);
      
      doc
        .fillColor(orangeAccent)
        .font("Helvetica-Bold")
        .fontSize(9)
        .text("ENERGY & SUPPLY SOLUTIONS", 45, 74, { characterSpacing: 1 });

      // Document Classification Header
      doc
        .fillColor(slateDark)
        .font("Helvetica-Bold")
        .fontSize(28)
        .text("INVOICE", 45, 45, { align: "right" });

      // Clean Solid Structural Separation Divider Rule
      doc
        .moveTo(45, 95)
        .lineTo(550, 95)
        .strokeColor(borderGray)
        .lineWidth(1.5)
        .stroke();

      // --- METADATA PROFILES ROW ---
      const metaY = 115;
      
      // Billed To Info Block
      doc
        .fillColor(slateLight)
        .font("Helvetica-Bold")
        .fontSize(9)
        .text("BILLED TO", 45, metaY, { characterSpacing: 0.5 });
      doc
        .fillColor(slateDark)
        .font("Helvetica-Bold")
        .fontSize(12)
        .text(invoiceData.userName, 45, metaY + 14);

      // Date Field Block
      doc
        .fillColor(slateLight)
        .font("Helvetica-Bold")
        .fontSize(9)
        .text("DATE ISSUED", 280, metaY, { characterSpacing: 0.5 });
      
      const formattedDate = new Date(invoiceData.quotaDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      doc
        .fillColor(slateMedium)
        .font("Helvetica")
        .fontSize(11)
        .text(formattedDate, 280, metaY + 14);

      // Unique Transaction Tracking Key Block
      doc
        .fillColor(slateLight)
        .font("Helvetica-Bold")
        .fontSize(9)
        .text("TRANSACTION ID", 410, metaY, { characterSpacing: 0.5 });
      doc
        .fillColor(slateDark)
        .font("Helvetica-Bold")
        .fontSize(10)
        .text(invoiceData.transactionId.toUpperCase(), 410, metaY + 14, { width: 140 });

      // --- ITEMIZED TABLE LAYOUT ---
      const tableTop = 185;
      
      // Table Data Headers
      doc
        .fillColor(slateMedium)
        .font("Helvetica-Bold")
        .fontSize(9)
        .text("PRODUCT DESCRIPTION", 45, tableTop, { characterSpacing: 0.5 });
      doc.text("VOLUME", 260, tableTop, { characterSpacing: 0.5 });
      doc.text("SUPPLY TYPE", 360, tableTop, { characterSpacing: 0.5 });
      doc.text("AMOUNT PAID", 460, tableTop, { align: "right", characterSpacing: 0.5 });

      // Table Header Underline Accent
      doc
        .moveTo(45, tableTop + 14)
        .lineTo(550, tableTop + 14)
        .strokeColor(slateDark)
        .lineWidth(1.5)
        .stroke();

      // Table Row Payload Rendering
      const rowY = tableTop + 26;
      doc
        .fillColor(slateDark)
        .font("Helvetica-Bold")
        .fontSize(11)
        .text(invoiceData.productName, 45, rowY, { width: 200, lineGap: 2 });
      
      doc
        .font("Helvetica")
        .fillColor(slateMedium)
        .text(invoiceData.volume, 260, rowY);
      
      doc.text(invoiceData.cylinderOrRefill, 360, rowY);
      
      const formattedAmount = invoiceData.totalAmount.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      
      doc
        .font("Helvetica-Bold")
        .fillColor(slateDark)
        .text(`TK ${formattedAmount}`, 460, rowY, { align: "right" });

      // Table Row Bottom Border Line
      doc
        .moveTo(45, rowY + 22)
        .lineTo(550, rowY + 22)
        .strokeColor(borderGray)
        .lineWidth(1)
        .stroke();

      // --- BILLING ACCOUNT SUMMARY COMPONENT BLOCK ---
      const summaryBoxTop = rowY + 50;
      const summaryBoxWidth = 240;
      const summaryBoxX = 550 - summaryBoxWidth;

      // Draw subtle background rectangle card shape container 
      doc
        .rect(summaryBoxX, summaryBoxTop, summaryBoxWidth, 76)
        .fillAndStroke(bgLight, borderGray);

      // Box Row 1: Subtotal
      doc
        .fillColor(slateMedium)
        .font("Helvetica")
        .fontSize(10)
        .text("Subtotal", summaryBoxX + 15, summaryBoxTop + 14);
      doc
        .text(`TK ${formattedAmount}`, summaryBoxX + 10, summaryBoxTop + 14, { align: "right", width: summaryBoxWidth - 25 });

      // Box Row 2: Tax / Charges (0% Representation)
      doc.text("VAT / Taxes (0%)", summaryBoxX + 15, summaryBoxTop + 32);
      doc.text("TK 0.00", summaryBoxX + 10, summaryBoxTop + 32, { align: "right", width: summaryBoxWidth - 25 });

      // Dashed split accent inside summary box
      doc
        .moveTo(summaryBoxX + 15, summaryBoxTop + 48)
        .lineTo(summaryBoxX + summaryBoxWidth - 15, summaryBoxTop + 48)
        .lineTo(summaryBoxX + summaryBoxWidth - 15, summaryBoxTop + 48)
        .strokeColor(borderGray)
        .lineWidth(1)
        .dash(4, { space: 2 })
        .stroke();

      // Box Row 3: Grand Total Amount Statement
      doc
        .fillColor(orangeAccent)
        .font("Helvetica-Bold")
        .fontSize(11)
        .undash() // Reset solid pathing calculations patterns
        .text("Total Paid", summaryBoxX + 15, summaryBoxTop + 54);
      doc.text(`TK ${formattedAmount} BDT`, summaryBoxX + 10, summaryBoxTop + 54, { align: "right", width: summaryBoxWidth - 25 });

      // --- MINIMAL SYSTEM FOOTER STATEMENT ---
      doc
        .moveTo(45, 730)
        .lineTo(550, 730)
        .strokeColor(borderGray)
        .lineWidth(1)
        .stroke();

      doc
        .fillColor(slateMedium)
        .font("Helvetica-Bold")
        .fontSize(10)
        .text("Thank you for your business with Taher Enterprise!", 45, 746, { align: "center", width: 505 });
      
      doc
        .fillColor(slateLight)
        .font("Helvetica")
        .fontSize(8.5)
        .text("This document represents an authorized digital transaction receipt generated automatically by system nodes.", 45, 762, { align: "center", width: 505 });

      doc.end();
    });
  } catch (error: any) {
    throw new AppError(500, `PDF generation failed: ${error.message}`);
  }
};