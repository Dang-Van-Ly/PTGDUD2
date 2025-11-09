import express from "express";
import { getOrders, addItemToOrder ,getOrderById, updateOrderItemQty ,updateOrderStatus } from "../controllers/orderController.js";

const router = express.Router();

// Lấy danh sách đơn hàng
router.get("/", getOrders);
// 🛒 Thêm sản phẩm vào đơn hàng
router.post("/add-item", addItemToOrder);

router.get("/:id", getOrderById); // 👈 Thêm dòng này
// PATCH /api/orders/:orderId/items/:productId
router.patch("/:orderId/items/:productId", updateOrderItemQty);
router.patch("/:orderId/status", updateOrderStatus);
export default router;
