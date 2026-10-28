// Loads .env locally so JWT_SECRET is set when this file imports app
// directly -- server.ts normally does this, but tests never go
// through server.ts. On GitHub there is no .env; JWT_SECRET comes
// from the repository secret in ci.yml instead, and dotenv silently
// does nothing when the file isn't there.
import "dotenv/config";
import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import { app } from "../src/app";

// app.ts waits for connectDB() in front of every route, and there is
// no database here or on GitHub's machine. This replaces the whole
// src/config/db module, for this test file only, with one whose
// connectDB does nothing. Vitest moves vi.mock above the imports, so
// app.ts gets this version even though it is imported first.
vi.mock("../src/config/db", () => ({
  connectDB: async () => {},
}));

// A token made the way POST /api/auth/login makes one: the same
// payload shape, signed with the same JWT_SECRET. No user has to
// exist, because requireAuth only checks the signature.
function tokenFor(userId: string): string {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: "5m",
  });
}

describe("POST /api/ai", () => {
  it("answers 401 when there is no token", async () => {
    const res = await request(app)
      .post("/api/ai")
      .send({ prompt: "A tricycle overcharged me near the Lipa market." });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe(
      "No token. Send Authorization: Bearer <token>",
    );
  });

  it("answers 401 when the token was signed with another secret", async () => {
    const forged = jwt.sign({ userId: "someone" }, "not-the-secret");

    const res = await request(app)
      .post("/api/ai")
      .set("Authorization", `Bearer ${forged}`)
      .send({ prompt: "A tricycle overcharged me near the Lipa market." });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Token is invalid or has expired");
  });

  it("lets a valid token through, then checks the body", async () => {
    // Nine characters, under the 20-character minimum, so
    // aiRequestSchema refuses it before reviewComplaint() runs --
    // Gemini is never called and no quota is spent.
    const res = await request(app)
      .post("/api/ai")
      .set("Authorization", `Bearer ${tokenFor("test-user")}`)
      .send({ prompt: "Too short" });

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual([
      "Describe the incident in at least 20 characters.",
    ]);
  });
});
