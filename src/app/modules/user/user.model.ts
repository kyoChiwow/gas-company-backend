import { model, Schema } from "mongoose";
import { IAuthProvider, IsActive, IUser, Role } from "./user.interface";

const authProviderSchema = new Schema<IAuthProvider>(
  {
    provider: {
      type: String,
      enum: ["credentials", "google"],
      required: true,
    },
    providerId: {
      type: String,
      required: true,
    },
  },
  {
    _id: false,
    versionKey: false,
  },
);

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
    },

    phone: { type: String },

    photo: { type: String },

    role: {
      type: [String],
      enum: Object.values(Role),
      default: [Role.USER],
    },

    isActive: {
      type: String,
      enum: Object.values(IsActive),
      default: IsActive.ACTIVE,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
    auths: {
      type: [authProviderSchema],
      required: true,
      validate: {
        validator: (val: IAuthProvider[]) => val.length > 0,
        message: "At least one auth provider is required",
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const User = model<IUser>("User", userSchema);