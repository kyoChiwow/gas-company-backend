import { model, Schema } from "mongoose";
import { ICategories } from "./categories.interface";

const categoriesSchema = new Schema<ICategories>(
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

export const Categories = model<ICategories>("Categories", categoriesSchema);