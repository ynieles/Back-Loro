import express from "express";
import {
  createAssignmentMiddleware,
  deleteAssignmenteMiddleware,
} from "../middlewares/assignment.middleware.js";
import {
  createAssignment,
  deleteAssignment,
  getAssignments,
} from "../controllers/assignment.controller.js";

const router = express.Router();

router.post("/", createAssignmentMiddleware, createAssignment);

router.get("/", getAssignments);

router.delete("/", deleteAssignmenteMiddleware, deleteAssignment);

export default router;
