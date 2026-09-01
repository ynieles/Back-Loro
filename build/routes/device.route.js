import express from "express";
import { createDeviceMiddleware, deleteDeviceMiddleware, restoreDeviceMiddleware, updateDeviceMiddleare, } from "../middlewares/device.middleware.js";
import { createDevice, deleteDevice, getDevices, restoreDevice, updateDevice, } from "../controllers/device.controller.js";
const router = express.Router();
router.post("/", createDeviceMiddleware, createDevice);
router.get("/", getDevices);
router.put("/:id", updateDeviceMiddleare, updateDevice);
router.delete("/:id", deleteDeviceMiddleware, deleteDevice);
router.patch("/restore/:id", restoreDeviceMiddleware, restoreDevice);
router.patch("/restaurar/:id", restoreDeviceMiddleware, restoreDevice);
export default router;
//# sourceMappingURL=device.route.js.map