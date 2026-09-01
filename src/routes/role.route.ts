import express from "express";
import { requireRole } from "../middlewares/auth.middleware.js";
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
const canMutate = requireRole(["admin", "administrador", "supervisor"]);

router.post("/", canMutate, createRoleMiddleware, createRole);

router.get("/", getRoles);

router.get("/:nombre", getOneRoleMiddleware, getOneRole);

router.put("/:id", canMutate, updateRoleMiddleware, updateRole);

router.delete("/:id", canMutate, deleteRoleMiddleware, deleteRole);

router.patch("/restore/:id", canMutate, restoreRoleMiddleware, restoreRole);
router.patch("/restaurar/:id", canMutate, restoreRoleMiddleware, restoreRole);

export default router;
