import { Types } from "mongoose";

export interface IAuthProvider {
    provider: "credentials" | "google";
    providerId: string;
}

export enum IsActive {
    ACTIVE = "active",
    INACTIVE = "inactive",
    BLOCKED = "BLOCKED",
}

export enum Role {
    SUPER_ADMIN = "SUPER_ADMIN",
    ADMIN = "ADMIN",
    USER = "USER",
    COMPANY = "COMPANY",
    DELIVERY_AGENT = "DELIVERY_AGENT",
    HUB_ADMIN = "HUB_ADMIN",
}

export interface IUser {
    _id?: Types.ObjectId;
    name: string;
    email: string;
    password?: string;
    phone?: string;
    photo?: string;
    
    role: Role[];

    isVerified?: boolean;
    isActive?: IsActive;
    isDeleted?: boolean;

    auths: IAuthProvider[];

    createdAt?: Date;
}