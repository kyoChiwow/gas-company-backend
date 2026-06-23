import z from "zod";
import { IsActive, Role } from "./user.interface";

export const createUserZodSchema = z.object({
  name: z
    .string({
      error: (issue) =>
        issue.code === "invalid_type"
          ? "Name must be string"
          : "Name is required",
    })
    .min(2, { message: "Name must be at least 2 characters long." })
    .max(50, { message: "Name cannot exceed 50 characters." }),

  email: z
    .email({ message: "Invalid email address format." })
    .min(5, { message: "Email must be at least 5 characters long." })
    .max(100, { message: "Email cannot exceed 100 characters." }),

  password: z
    .string({
      error: (issue) =>
        issue.code === "invalid_type"
          ? "Password must be string"
          : "Password is required",
    })
    .min(8, { message: "Password must be at least 8 characters long." })
    .regex(/^(?=.*[A-Z])/, {
      message: "Password must contain at least 1 uppercase letter.",
    })
    .regex(/^(?=.*[!@#$%^&*])/, {
      message: "Password must contain at least 1 special character.",
    })
    .regex(/^(?=.*\d)/, {
      message: "Password must contain at least 1 number.",
    }),

  phone: z
    .string({
      error: (issue) =>
        issue.code === "invalid_type"
          ? "Number must be string"
          : "Number is required",
    })
    .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
      message:
        "Phone number must be valid for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
    })
    .optional(),

  photo: z.url().optional(),

  role: z.array(z.enum(Role)).optional().default([Role.USER]),

  isVerified: z.boolean().optional(),

  isActive: z.enum(IsActive).optional(),

  isDeleted: z.boolean().optional(),

  address: z
    .string({
      error: (issue) =>
        issue.code === "invalid_type"
          ? "Address must be string"
          : "Address is required",
    })
    .max(200, { message: "Address cannot exceed 200 characters." })
    .optional(),
});

export const updateUserZodSchema = z
  .object({
    name: z
      .string({
        error: (issue) =>
          issue.code === "invalid_type"
            ? "Name must be string"
            : "Name is required",
      })
      .min(2, { message: "Name must be at least 2 characters long." })
      .max(50, { message: "Name cannot exceed 50 characters." })
      .optional(),

    phone: z
      .string({
        error: (issue) =>
          issue.code === "invalid_type"
            ? "Number must be string"
            : "Number is required",
      })
      .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
        message:
          "Phone number must be valid for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
      })
      .optional(),

    role: z.array(z.enum(Role)).optional(),

    isActive: z.enum(IsActive).optional(),

    isDeleted: z
      .boolean({
        error: (issue) =>
          issue.code === "invalid_type"
            ? "isDeleted must be boolean"
            : "isDeleted is required",
      })
      .optional(),

    isVerified: z
      .boolean({
        error: (issue) =>
          issue.code === "invalid_type"
            ? "isVerified must be boolean"
            : "isVerified is required",
      })
      .optional(),

    address: z
      .string({
        error: (issue) =>
          issue.code === "invalid_type"
            ? "Address must be string"
            : "Address is required",
      })
      .max(200, { message: "Address cannot exceed 200 characters." })
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });
