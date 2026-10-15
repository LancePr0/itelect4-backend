import { Schema, model } from "mongoose";
import { ComplaintStatus } from "../types/index";
import type { ComplaintDoc } from "../types/index";

const complaintSchema = new Schema<ComplaintDoc>({
  // Not a number any more. This holds the _id of a User document, and
  // ref tells Mongoose which collection that id points into.
  filedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // A plain Number in GT4 Part 1, back when Tricycle had no schema of
  // its own to point at. Now it does, so this is an ObjectId ref like
  // filedBy above -- the same move Session 9 made for studentId once
  // Submission needed a real User to belong to.
  tricycleId: {
    type: Schema.Types.ObjectId,
    ref: "Tricycle",
    required: [true, "tricycleId is required"],
  },

  complainantName: {
    type: String,
    required: [true, "complainantName is required"],
    trim: true,
  },

  issueDescription: {
    type: String,
    required: [true, "issueDescription is required"],
    trim: true,
  },

  // The Session 1 union, enforced here as well -- the same idea as
  // Session 8's Zod enum, now the rule instead of a courtesy.
  status: {
    type: String,
    enum: [ComplaintStatus.PENDING, ComplaintStatus.RESOLVED, ComplaintStatus.REJECTED],
    default: ComplaintStatus.PENDING,
  },

  filedAt: { type: Date, default: Date.now },
});

// FROM SESSION 7: the frontend's Complaint type differs from the wire
// shape (string ids, ISO date strings) the same way ApiSubmission did.
// This transform closes that gap, so a future frontend swap keeps
// reading .id and .filedAt exactly as it has since Session 1.
complaintSchema.set("toJSON", {
  transform(_doc, ret: Record<string, unknown>) {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Complaint = model<ComplaintDoc>("Complaint", complaintSchema);
