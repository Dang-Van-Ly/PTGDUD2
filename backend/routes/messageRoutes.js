// routes/messageRoutes.js
import express from "express";
import { getAllMessages, getMessagesByCustomer, addMessage } from "../controllers/messageController.js";

const router = express.Router();

// GET /api/messages — lấy toàn bộ
router.get("/", getAllMessages);

// GET /api/messages/:customerId — lấy theo customer
router.get("/:customerId", getMessagesByCustomer);

// POST /api/messages — thêm tin nhắn mới
router.post("/", addMessage);

export default router;
