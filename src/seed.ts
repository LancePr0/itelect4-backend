import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "./config/db";
import { Tricycle } from "./models/Tricycle";
import { TRICYCLES } from "./data/tricycles";

// npm run seed. Run it once after the database is created, and again
// after anything that empties it. Nothing else in the project writes a
// tricycle.
async function seed() {
  await connectDB();

  for (const tricycle of TRICYCLES) {
    // upsert: update the row with this plate number, or insert it if
    // there is none. Running this a second time leaves three tricycles,
    // not six.
    await Tricycle.updateOne(
      { plateNumber: tricycle.plateNumber },
      tricycle,
      { upsert: true },
    );
  }

  console.log(`${TRICYCLES.length} tricycles in ${mongoose.connection.name}`);

  // Without this the script never ends: the connection is an open
  // socket, and Node keeps running while one is still open.
  await mongoose.disconnect();
}

seed().catch((err: unknown) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
