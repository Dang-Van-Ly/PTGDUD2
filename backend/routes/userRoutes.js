import express from "express";
import { getUsers, getUserById } from "../controllers/userController.js";

const router = express.Router();

// Lấy danh sách người dùng
router.get("/", getUsers);

// Lấy người dùng theo id
router.get("/:id", getUserById);

export default router;
