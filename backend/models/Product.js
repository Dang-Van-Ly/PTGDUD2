import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  id: String,
  restaurant_id: String,
  name: String,
  description: String,
  price: Number,
  category: String,
  is_available: Boolean,
  is_popular: Boolean,
  rating: Number,
  purchase_count: Number,
  image_url: String,
  options: Array,
  addons: Array,
});

export default mongoose.model("Product", productSchema);
