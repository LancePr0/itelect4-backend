import mongoose from "mongoose";

// The promise, kept. Not the connection -- the promise of one. The
// first caller starts the connect; every caller after it gets this same
// promise back and waits on the connection already being made.
//
// On a laptop this file is loaded once, at startup. Deployed, Vercel can
// load it again on every new instance and reach connectDB from a
// request, so without this a connect would run once per request instead
// of once per process -- and a free Atlas cluster only allows 500 of
// those at once.
let connection: Promise<typeof mongoose> | null = null;

export function connectDB(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;

  // Fail here, with a sentence, rather than three screens later with a
  // connection timeout that does not mention .env at all.
  if (!uri) {
    throw new Error(
      "MONGODB_URI is missing. Copy .env.example to .env and fill it in.",
    );
  }

  if (connection === null) {
    // Without this option, a wrong or unreachable connection string does
    // not fail -- it sits there for 31 seconds looking like a hung
    // terminal, and then errors. Five seconds is long enough for a real
    // Atlas connection and short enough to tell you something is wrong.
    connection = mongoose
      .connect(uri, { serverSelectionTimeoutMS: 5000 })
      .then((m) => {
        console.log("MongoDB connected:", m.connection.name);
        return m;
      })
      .catch((err: unknown) => {
        // A failed attempt must not be the thing that gets kept. Leave
        // the rejected promise out of it and every request from now on
        // would fail with this same stale error, including ones sent
        // after the database comes back.
        connection = null;
        throw err;
      });
  }

  return connection;
}
