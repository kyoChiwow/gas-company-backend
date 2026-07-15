/* eslint-disable @typescript-eslint/no-explicit-any */

import { Readable } from "stream";
import cloudinary from "../config/cloudinary";


export const uploadPdfBufferToCloudinary = (pdfBuffer: Buffer, folderName: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folderName,
        resource_type: "raw",
        format: "pdf",
      },
      (error: any, result: any) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    Readable.from(pdfBuffer).pipe(uploadStream);
  });
};