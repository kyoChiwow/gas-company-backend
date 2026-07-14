import { model, Schema } from "mongoose";
import { IProduct } from "./product.interface";

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    brand: { type: Schema.Types.ObjectId, ref: "Brand" },
    section: { type: Schema.Types.ObjectId, ref: "Section" },
    type: { type: Schema.Types.ObjectId, ref: "Type" },
    categories: [{ type: Schema.Types.ObjectId, ref: "Categories" }],
    photo: { type: String },
    description: { type: String },
    price: { type: String },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

export const Product = model<IProduct>("Product", productSchema);
