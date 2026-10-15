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

// Tricycle never had an id of its own at this layer either -- Mongo
// assigns one, the same as Course does in the class demo.
export type TricycleDoc = Omit<Tricycle, "id">;

// filedBy and tricycleId are both ObjectIds, not numbers. An ObjectId is
// an object that PRINTS as 24 hex characters -- it only becomes a real
// string when the document is turned into JSON.
//
// tricycleId started as a plain Number in GT4 Part 1, back when Tricycle
// had no schema of its own and nothing real to point at. Now that
// Tricycle is a real collection, a complaint has to reference an actual
// document in it -- the same move filedBy already made for User.
export type ComplaintDoc = Omit<
  Complaint,
  "id" | "filedBy" | "tricycleId"
> & {
  filedBy: Types.ObjectId;
  tricycleId: Types.ObjectId;
};

// The body a client sends to create one. No id, and no filedBy -- the
// server reads that off the token instead of trusting the request.
//
// tricycleId is typed string here, not number: the Session 1 interface
// still says number, but what a client actually sends is the tricycle's
// real 24-character MongoDB id. Mongoose casts the string to an
// ObjectId when the document is created.
export type NewComplaintBody = Omit<
  Pick<Complaint, "tricycleId" | "complainantName" | "issueDescription">,
  "tricycleId"
> & {
  tricycleId: string;
};
