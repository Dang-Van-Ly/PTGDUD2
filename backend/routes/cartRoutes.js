import express from "express";
import { getCarts } from "../controllers/cartController.js";

const router = express.Router();

// Lấy danh sách giỏ hàng
router.get("/", getCarts);

export default router;
