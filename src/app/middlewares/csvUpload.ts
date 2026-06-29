import multer from "multer";
import httpStatus from "http-status-codes";
import AppError from "../errorHelpers/appError";

const storage = multer.memoryStorage();

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  const isCSV =
    file.mimetype === "text/csv" ||
    file.mimetype === "application/vnd.ms-excel" ||
    file.originalname.toLowerCase().endsWith(".csv");

  if (!isCSV) {
    return cb(
      new AppError(httpStatus.BAD_REQUEST, "Only CSV files are allowed!"),
    );
  }

  cb(null, true);
};

export const csvUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB, adjust as needed
  },
});