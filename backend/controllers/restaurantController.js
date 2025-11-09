import mongoose from "mongoose";
import Restaurant from "../models/Restaurant.js";
import Product from "../models/Product.js";
import Review from "../models/Review.js";

// Lấy tất cả nhà hàng
export const getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find();
    res.json(restaurants);
  } catch (err) {
    res.status(500).json({ message: "Error fetching restaurants", error: err.message });
  }
};

// Thêm nhà hàng mới
export const addRestaurant = async (req, res) => {
  try {
    const newRes = await Restaurant.create(req.body);
    res.status(201).json(newRes);
  } catch (err) {
    res.status(500).json({ message: "Error adding restaurant", error: err.message });
  }
};

// Lấy thông tin 1 nhà hàng
export const getRestaurantById = async (req, res) => {
  try {
    const { id } = req.params;

    // Lấy restaurant theo id logic
    const restaurant = await Restaurant.findOne({ id: id });
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Lấy sản phẩm và review dựa trên ObjectId thật
    const products = await Product.find({ restaurant: restaurant._id });
    const reviews = await Review.find({ restaurant: restaurant._id }).populate("user");

    res.json({ restaurant, products, reviews });
  } catch (error) {
    console.error("Error in getRestaurantById:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



