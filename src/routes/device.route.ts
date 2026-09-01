import express from "express";
import { requireRole } from "../middlewares/auth.middleware.js";
import {
  createDeviceMiddleware,
  deleteDeviceMiddleware,
  restoreDeviceMiddleware,
  updateDeviceMiddleare,
} from "../middlewares/device.middleware.js";
import {
  createDevice,
  deleteDevice,
  getDeviceHistory,
  getDevices,
  restoreDevice,
  updateDevice,
} from "../controllers/device.controller.js";

const router = express.Router();
const canMutate = requireRole(["admin", "administrador", "supervisor"]);

router.post("/", canMutate, createDeviceMiddleware, createDevice);

router.get("/", getDevices);

router.get("/history/:id", getDeviceHistory);
router.get("/:id/history", getDeviceHistory);

router.put("/:id", canMutate, updateDeviceMiddleare, updateDevice);

router.delete("/:id", canMutate, deleteDeviceMiddleware, deleteDevice);

router.patch("/restore/:id", canMutate, restoreDeviceMiddleware, restoreDevice);
router.patch("/restaurar/:id", canMutate, restoreDeviceMiddleware, restoreDevice);

export default router;

