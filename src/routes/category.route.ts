import express from "express";
import { requireRole } from "../middlewares/auth.middleware.js";
import {
  createCategoryMiddleware,
  deleteCategoryMiddleware,
  getOneCategoryMiddleware,
  restoreCategoryMiddleware,
  updateCategoryMiddleware,
} from "../middlewares/category.middleware.js";
import {
  createCategory,
  deleteCategory,
  getCategorys,
  getOneCategory,
  restoreCategory,
  updateCategory,
} from "../controllers/category.controller.js";

const router = express.Router();
const canMutate = requireRole(["admin", "administrador", "supervisor"]);

router.post("/", canMutate, createCategoryMiddleware, createCategory);

router.get("/", getCategorys);

router.get("/:nombre", getOneCategoryMiddleware, getOneCategory);

router.put("/:id", canMutate, updateCategoryMiddleware, updateCategory);

router.delete("/:id", canMutate, deleteCategoryMiddleware, deleteCategory);

router.patch("/restore/:id", canMutate, restoreCategoryMiddleware, restoreCategory);

export default router;
