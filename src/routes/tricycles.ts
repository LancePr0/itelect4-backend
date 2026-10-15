import { Router, type Request, type Response } from "express";
import { Tricycle } from "../models/Tricycle";

export const tricycleRouter = Router();

// No requireAuth in this file, on purpose. Filing a complaint means
// picking a tricycle from a list, and that list has to be visible before
// anybody has logged in -- the same reason courses are public in the
// class demo.

// GET /api/tricycles
tricycleRouter.get("/", async (_req: Request, res: Response) => {
  const tricycles = await Tricycle.find().sort({ plateNumber: 1 });
  res.json(tricycles);
});

interface IdParam {
  id: string;
}

// GET /api/tricycles/:id
tricycleRouter.get(
  "/:id",
  async (req: Request<IdParam>, res: Response) => {
    const tricycle = await Tricycle.findById(req.params.id);

    if (!tricycle) {
      res.status(404).json({ message: "No tricycle with that id" });
      return;
    }

    res.json(tricycle);
  },
);
