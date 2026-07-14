import { Types } from "mongoose";

export interface IProduct {
  _id?: string;
  name: string;
  brand?: Types.ObjectId;
  section?: Types.ObjectId;
  type?: Types.ObjectId;
  categories?: Types.ObjectId[];
  photo?: string[];
  description?: string;
  price?: string;
}


export interface IProductInput {
  name: string;
  brand?: string;
  section?: string;
  type?: string;
  categories?: string[];
}


export interface IProductCSVRow {
  name: string;
  brand?: string;
  section?: string;
  type?: string;
  categories?: string;
  description?: string;
  price?: string;
}