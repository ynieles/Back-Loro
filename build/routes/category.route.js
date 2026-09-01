import express from "express";
import { createCategoryMiddleware, deleteCategoryMiddleware, getOneCategoryMiddleware, restoreCategoryMiddleware, updateCategoryMiddleware, } from "../middlewares/category.middleware.js";
import { createCategory, deleteCategory, getCategorys, getOneCategory, restoreCategory, updateCategory, } from "../controllers/category.controller.js";
const router = express.Router();
router.post("/", createCategoryMiddleware, createCategory);
router.get("/", getCategorys);
router.get("/:nombre", getOneCategoryMiddleware, getOneCategory);
router.put("/:id", updateCategoryMiddleware, updateCategory);
router.delete("/:id", deleteCategoryMiddleware, deleteCategory);
router.patch("/restore/:id", restoreCategoryMiddleware, restoreCategory);
export default router;
//# sourceMappingURL=category.route.js.map