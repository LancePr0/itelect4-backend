import { Schema, model } from "mongoose";
import type { TricycleDoc } from "../types/index";

// Read-only reference data -- the role Course plays in the class demo.
// Nobody creates a tricycle through the API; the three rows come from
// src/data/tricycles.ts via src/seed.ts.
const tricycleSchema = new Schema<TricycleDoc>({
  plateNumber: {
    type: String,
    required: [true, "plateNumber is required"],
    unique: true,
    trim: true,
  },

  operatorName: {
    type: String,
    required: [true, "operatorName is required"],
    trim: true,
  },

  phoneNumber: {
    type: String,
    required: [true, "phoneNumber is required"],
    trim: true,
  },
});

// Same as User and Complaint: the frontend has read .id since Session 1,
// so Mongo's _id is renamed here rather than changing every caller.
tricycleSchema.set("toJSON", {
  transform(_doc, ret: Record<string, unknown>) {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Tricycle = model<TricycleDoc>("Tricycle", tricycleSchema);
