import mongoose from "mongoose";

const orderSmockSchema = new mongoose.Schema(
  {
    idCustomer: {
      type: String, // hoặc mongoose.Schema.Types.ObjectId nếu bạn có User model
      required: true,
    },
    customer: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    addressRestaurant: {
      type: String,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    payment: {
      type: String,
      required: true,
    },
    items: [
      {
        name: { type: String, required: true },
        qty: { type: Number, required: true },
      },
    ],
    isAccepted: {
      type: Boolean,
      default: false,
    },
    storeLocation: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    customerLocation: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
  },
  {
    timestamps: true, // tự động tạo createdAt & updatedAt
  }
);

const OrderSmock = mongoose.model("OrderMock", orderSmockSchema);
export default  OrderSmock ;
