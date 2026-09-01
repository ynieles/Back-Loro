import express from "express";
import { requireRole } from "../middlewares/auth.middleware.js";
import {
  createAssignmentMiddleware,
  deleteAssignmenteMiddleware,
} from "../middlewares/assignment.middleware.js";
import {
  createAssignment,
  deleteAssignment,
  getAssignmentHistory,
  getAssignments,
} from "../controllers/assignment.controller.js";

const router = express.Router();
const canMutate = requireRole(["admin", "administrador", "supervisor"]);

router.post("/", canMutate, createAssignmentMiddleware, createAssignment);

router.get("/", getAssignments);

router.get("/history/:id", getAssignmentHistory);
router.get("/:id/history", getAssignmentHistory);

router.delete("/:id", canMutate, deleteAssignmenteMiddleware, deleteAssignment);

export default router;

