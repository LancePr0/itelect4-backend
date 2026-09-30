import { Router, type Request, type Response } from "express";
import { Complaint } from "../models/Complaint";
import { requireAuth } from "../middleware/auth";
import type { NewComplaintBody } from "../types/index";

export const complaintRouter = Router();

// One line, and every route in this file is behind the token check.
// Anything above this line would be public; everything below needs a
// valid Authorization header.
complaintRouter.use(requireAuth);

interface IdParam {
  id: string;
}

// GET /api/complaints -- only the ones filed by this token's user
complaintRouter.get("/", async (req: Request, res: Response) => {
  const complaints = await Complaint.find({
    filedBy: req.userId,
  }).sort({ filedAt: -1 });
  res.json(complaints);
});

// GET /api/complaints/:id
complaintRouter.get(
  "/:id",
  async (req: Request<IdParam>, res: Response) => {
    // Both halves matter: the right row, AND the right owner. Without
    // filedBy here, changing the id in the URL reads another row.
    const complaint = await Complaint.findOne({
      _id: req.params.id,
      filedBy: req.userId,
    });

    if (!complaint) {
      res.status(404).json({ message: "No complaint with that id" });
      return;
    }

    res.json(complaint);
  },
);

// POST /api/complaints
complaintRouter.post(
  "/",
  async (
    req: Request<unknown, unknown, NewComplaintBody>,
    res: Response,
  ) => {
    const complaint = await Complaint.create({
      ...req.body,
      // Not req.body.filedBy. The owner comes off the verified
      // token, so a request cannot claim to be someone else by id.
      filedBy: req.userId,
    });

    res.status(201).json(complaint);
  },
);

// PATCH /api/complaints/:id
complaintRouter.patch(
  "/:id",
  async (
    req: Request<IdParam, unknown, Partial<NewComplaintBody>>,
    res: Response,
  ) => {
    const complaint = await Complaint.findOneAndUpdate(
      { _id: req.params.id, filedBy: req.userId },
      req.body,
      // new: return the row AFTER the change, not before.
      // runValidators: schema rules are skipped on updates otherwise.
      { new: true, runValidators: true },
    );

    if (!complaint) {
      res.status(404).json({ message: "No complaint with that id" });
      return;
    }

    res.json(complaint);
  },
);

// DELETE /api/complaints/:id
complaintRouter.delete(
  "/:id",
  async (req: Request<IdParam>, res: Response) => {
    const complaint = await Complaint.findOneAndDelete({
      _id: req.params.id,
      filedBy: req.userId,
    });

    if (!complaint) {
      res.status(404).json({ message: "No complaint with that id" });
      return;
    }

    // 204 means "done, and there is deliberately no body to send".
    res.status(204).send();
  },
);
