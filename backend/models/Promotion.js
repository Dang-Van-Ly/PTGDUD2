import mongoose from "mongoose";

const promotionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    type: { type: String, enum: ["app", "restaurant"], required: true },
    restaurantId: { type: String, default: null },
    discount: {
      type: { type: String },
      value: mongoose.Schema.Types.Mixed,
    },
    condition: {
      minOrder: Number,
      paymentMethod: { type: String, default: null },
      userType: { type: String, default: "all" },
    },
    validFrom: String,
    validTo: String,
    title: String,
    description: String,
    discountAmount: Number,
  },
  { timestamps: true }
);

const Promotion = mongoose.model("Promotion", promotionSchema);
export default Promotion;
