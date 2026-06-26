import { model, Schema } from "mongoose";
import { ISection } from "./section.interface";

const sectionSchema = new Schema<ISection>(
  {
    name: { type: String, required: true },
    description: { type: String },
    slug: { type: String, unique: true },
  },
  { timestamps: true, versionKey: false },
);

export const Section = model<ISection>("Section", sectionSchema);
