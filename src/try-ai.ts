import "dotenv/config";
import { reviewComplaint } from "./ai/gemini";

// npm run try-ai. One real request to Gemini from your terminal -- the
// same function POST /api/ai calls, with no Express, no token and no
// database. Run it once the key is in .env: if this prints a review,
// the key, the model name and the schema all work.
async function tryAi() {
  const review = await reviewComplaint(
    "A tricycle overcharged me on the way to the Lipa public market " +
      "yesterday afternoon, asking for 100 pesos for a trip that " +
      "normally costs 25.",
  );
  console.log(JSON.stringify(review, null, 2));
}

tryAi().catch((err: unknown) => {
  console.error("Gemini call failed:", err);
  process.exit(1);
});
