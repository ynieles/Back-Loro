import express from "express";
import { requireRole } from "../middlewares/auth.middleware.js";
import {
  createUserMiddleware,
  updateUserMiddleware,
  updatePasswordMiddleware,
} from "../middlewares/user.middleware.js";
import {
  createUser,
  getUsers,
  getOneUser,
  updateUser,
  updateUserPassword,
  deleteUser,
  restoreUser,
} from "../controllers/user.controller.js";

const router = express.Router();

const adminOnly = requireRole(["admin", "administrador"]);

router.get("/", adminOnly, getUsers);
router.get("/:id", adminOnly, getOneUser);
router.post("/", adminOnly, createUserMiddleware, createUser);
router.put("/:id", adminOnly, updateUserMiddleware, updateUser);
router.patch("/password/:id", adminOnly, updatePasswordMiddleware, updateUserPassword);
router.delete("/:id", adminOnly, deleteUser);
router.patch("/restore/:id", adminOnly, restoreUser);

export default router;

