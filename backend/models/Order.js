import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    idCart: { type: String, required: true },
    idRestaurant: { type: String },
    userId: { type: String, required: true },
    status: { type: String, required: true, default: "chua_dat" },
    total: { type: Number, required: true, default: 0 },
    createdAt: { type: Date, default: Date.now },
    items: [
      {
        idProduct: String,
        quantity: Number,
        note: String,
        subtotal: Number,
      },
    ],
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
