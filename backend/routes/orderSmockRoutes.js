import express from "express";
import {
  getAllOrderSmocks,
  createOrderSmock,
} from "../controllers/orderSmockController.js";

const router = express.Router();

router.get("/", getAllOrderSmocks);  // Lấy tất cả đơn hàng
router.post("/", createOrderSmock);  // Tạo mới đơn hàng

export default router;
