import type { Types } from "mongoose";

// FROM SESSION 1: copied from itelect4-project's src/types/index.ts.
// These are the reason this backend has the shape it has: the schemas in
// src/models/ are these interfaces again, written a second time in a form
// the database can enforce.

export enum ComplaintStatus {
  PENDING = "PENDING",
  RESOLVED = "RESOLVED",
  REJECTED = "REJECTED",
}

export const enum Role {
  Admin = "admin",
  Officer = "officer",
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
}

export interface Tricycle {
  id: number;
  plateNumber: string;
  operatorName: string;
  phoneNumber: string;
}

export interface Complaint {
  id: number;
  // NEW for GT4 -- the original Session 1 interface never needed an owner,
  // because the frontend only ever had one hard-coded officer. A resource
  // with full CRUD scoped to "the token's user" needs one, the same way
  // Session 9's Submission always had studentId.
  filedBy: number;
  tricycleId: number;
  complainantName: string;
  issueDescription: string;
  status: ComplaintStatus;
  filedAt: Date;
}

// ---------------------------------------------------------------------
// What the database actually stores.
//
// Session 1 wrote `id: number` because there was no database yet. MongoDB
// numbers rows itself, with a 24-character hex string, so every id here
// is a string once it reaches JSON -- see the toJSON transforms in
// src/models/.
//
// Both types below are DERIVED from the interfaces above with Omit --
// the utility type from Session 2. The interfaces stay the single source
// of truth: add a field there and these inherit it.
// ---------------------------------------------------------------------

export type UserDoc = Omit<User, "id"> & {
  password: string;
};

// filedBy is an ObjectId, not a number. An ObjectId is an object that
// PRINTS as 24 hex characters -- it only becomes a real string when the
// document is turned into JSON.
export type ComplaintDoc = Omit<Complaint, "id" | "filedBy"> & {
  filedBy: Types.ObjectId;
};

// The body a client sends to create one. No id, and no filedBy -- the
// server reads that off the token instead of trusting the request.
export type NewComplaintBody = Pick<
  Complaint,
  "tricycleId" | "complainantName" | "issueDescription"
>;
