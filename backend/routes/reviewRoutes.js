import express from "express";
import { getReviews } from "../controllers/reviewController.js";

const router = express.Router();

// Lấy tất cả review hoặc theo nhà hàng
router.get("/:id", getReviews);

export default router;
