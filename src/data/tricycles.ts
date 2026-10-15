import type { TricycleDoc } from "../types/index";

// The three tricycles itelect4-project's db.json has held since Session 7,
// word for word. Reference data: nobody creates one through the API, so
// it lives here and goes into the database once, from src/seed.ts.
export const TRICYCLES: TricycleDoc[] = [
  {
    plateNumber: "LP-1234",
    operatorName: "Juan dela Cruz",
    phoneNumber: "09171234567",
  },
  {
    plateNumber: "LP-5678",
    operatorName: "Mario Reyes",
    phoneNumber: "09179876543",
  },
  {
    plateNumber: "LP-9012",
    operatorName: "Ben Santos",
    phoneNumber: "09175551234",
  },
];
