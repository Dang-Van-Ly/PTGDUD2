// models/Message.js
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    customerId: { type: String, required: true }, // id khách hàng
    userId: { type: String, required: true },     // id người nhận / người gửi còn lại
    messages: [
      {
        sender: { type: String, required: true }, // "customer" hoặc "user"
        text: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
export default Message;
