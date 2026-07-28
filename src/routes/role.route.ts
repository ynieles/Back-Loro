import express from "express";
import {
  createRole,
  deleteRole,
  getOneRole,
  getRoles,
  restoreRole,
  updateRole,
} from "../controllers/role.controller.js";
import {
  createRoleMiddleware,
  deleteRoleMiddleware,
  getOneRoleMiddleware,
  restoreRoleMiddleware,
  updateRoleMiddleware,
} from "../middlewares/role.middleware.js";

const router = express.Router();

router.post("/", createRoleMiddleware, createRole);

router.get("/", getRoles);

router.get("/:nombre", getOneRoleMiddleware, getOneRole);

router.put("/:id", updateRoleMiddleware, updateRole);

router.delete("/:id", deleteRoleMiddleware, deleteRole);

router.patch("/restaurar/:id", restoreRoleMiddleware, restoreRole);

export default router;
