import express from "express";
import {
  getAllRestaurants,
  addRestaurant,
  getRestaurantById,

} from "../controllers/restaurantController.js";

const router = express.Router();

router.get("/", getAllRestaurants);
router.post("/", addRestaurant);

// /api/restaurants/:id
router.get("/:id", getRestaurantById);


export default router;
