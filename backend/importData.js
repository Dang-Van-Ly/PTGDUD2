import mongoose from "mongoose";
import dotenv from "dotenv";

// 🧠 Import models
import Restaurant from "./models/Restaurant.js";
import Product from "./models/Product.js";
import User from "./models/User.js";
import Review from "./models/Review.js";
import Cart from "./models/Cart.js";
import Order from "./models/Order.js";
import Promotion from "./models/Promotion.js";
import OrderSmock from "./models/OrderSmock.js";
import Message from "./models/Message.js";
// 📦 Import mock data
import {
  restaurants,
  products,
  users,
  reviews,
  carts,
  orders,
  promotions,
  ordersMock,
  messages,
} from "./mockData.js";

dotenv.config();

const importData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // 🧹 Xóa dữ liệu cũ
    await Promise.all([
      Restaurant.deleteMany({}),
      Product.deleteMany({}),
      User.deleteMany({}),
      Review.deleteMany({}),
      Cart.deleteMany({}),
      Order.deleteMany({}),
      Promotion.deleteMany({}),
      OrderSmock.deleteMany({}),
      Message.deleteMany({}),
    ]);
    console.log("🗑️ Old data cleared");

    // 📥 Thêm dữ liệu mới
    await Promise.all([
      Restaurant.insertMany(restaurants),
      Product.insertMany(products),
      User.insertMany(users),
      Review.insertMany(reviews),
      Cart.insertMany(carts),
      Order.insertMany(orders),
      Promotion.insertMany(promotions),
      OrderSmock.insertMany(ordersMock),
      Message.insertMany(messages),
    ]);
    console.log("🍽️ Imported all mock data successfully!");

    process.exit();
  } catch (error) {
    console.error("❌ Error importing data:", error);
    process.exit(1);
  }
};

importData();
