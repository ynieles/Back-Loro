import express from "express";
import { createUserMiddleware, updateUserMiddleware, updatePasswordMiddleware, } from "../middlewares/user.middleware.js";
import { createUser, getUsers, getOneUser, updateUser, updateUserPassword, deleteUser, restoreUser, } from "../controllers/user.controller.js";
const router = express.Router();
router.get("/", getUsers);
router.get("/:id", getOneUser);
router.post("/", createUserMiddleware, createUser);
router.put("/:id", updateUserMiddleware, updateUser);
router.patch("/password/:id", updatePasswordMiddleware, updateUserPassword);
router.delete("/:id", deleteUser);
router.patch("/restore/:id", restoreUser);
export default router;
//# sourceMappingURL=user.route.js.map