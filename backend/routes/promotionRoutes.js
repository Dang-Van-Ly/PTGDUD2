import express from "express";
import { getPromotions } from "../controllers/promotionController.js";

const router = express.Router();

// Lấy danh sách khuyến mãi
router.get("/", getPromotions);

export default router;
