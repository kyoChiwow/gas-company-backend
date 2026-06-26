import { model, Schema } from "mongoose";
import { IBrand } from "./brand.interface";

const brandSchema = new Schema<IBrand>(
    {
        name: { type: String, required: true },
        slug: { type: String, unique: true },
        description: { type: String },
    },
    {
        timestamps: true,
        versionKey: false
    }
)

export const Brand = model<IBrand>("Brand", brandSchema);