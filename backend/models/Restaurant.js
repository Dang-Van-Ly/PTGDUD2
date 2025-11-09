import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema({
  id: String,
  name: String,
  cuisine_type: [String],
  rating: Number,
  estimated_delivery_time: Number,
  delivery_fee: Number,
  min_order_value: Number,
  is_open: Boolean,
  description: String,
  location: {
    latitude: Number,
    longitude: Number,
  },
  rating_count: Number,
  image_url: String,
  address: String,
}, { timestamps: true });

const Restaurant = mongoose.model("Restaurant", restaurantSchema);
export default Restaurant;
