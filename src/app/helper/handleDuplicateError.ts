/* eslint-disable @typescript-eslint/no-explicit-any */
import { TGenericErrorResponse } from "../interfaces/error.types";

export const handleDuplicateError = (err: any): TGenericErrorResponse => {
  const field = Object.keys(err.keyValue ?? {})[0] ?? "field";
  const value = err.keyValue?.[field] ?? "unknown";

  return {
    statusCode: 400,
    message: `Duplicate ${field}: "${value}". Please use another value!`,
  };
};