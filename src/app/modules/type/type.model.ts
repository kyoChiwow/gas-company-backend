import { model, Schema } from "mongoose";
import { IType } from "./type.interface";

const typeSchema = new Schema<IType>(
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

export const Type = model<IType>("Type", typeSchema);