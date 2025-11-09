import express from "express";
import { getProducts, createProduct,getProductsByRestaurant, getProductById } from "../controllers/productController.js";

const router = express.Router();

router.get("/", getProductsByRestaurant);
router.get("/:id", getProductById);       // ✅ lấy chi tiết sản phẩm theo id
router.post("/", createProduct);

export default router;
