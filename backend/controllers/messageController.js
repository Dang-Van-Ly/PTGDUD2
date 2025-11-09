// controllers/messageController.js
import Message from "../models/Message.js";

// 📩 Lấy tất cả tin nhắn
export const getAllMessages = async (req, res) => {
  try {
    const messages = await Message.find();
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy tin nhắn" });
  }
};

// 📩 Lấy tin nhắn theo customerId
// 📩 Lấy tin nhắn theo customerId và userId
export const getMessagesByCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { userId } = req.query; // lấy từ query string

    if (!userId) return res.status(400).json({ error: "Thiếu userId" });

    let conversation = await Message.findOne({ customerId, userId });

    // Nếu chưa có, tạo mới
    if (!conversation) {
      conversation = new Message({
        customerId,
        userId,
        messages: [],
      });
      await conversation.save();
    }

    res.json(conversation);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy tin nhắn" });
  }
};


// 📨 Gửi thêm 1 tin nhắn mới
export const addMessage = async (req, res) => {
  try {
    const { customerId, userId, sender, text } = req.body;

    // Tìm đoạn hội thoại cũ
    let conversation = await Message.findOne({ customerId, userId });

    if (!conversation) {
      // Tạo mới nếu chưa có
      conversation = new Message({
        customerId,
        userId,
        messages: [{ sender, text }],
      });
    } else {
      // Thêm vào mảng messages
      conversation.messages.push({ sender, text });
    }

    await conversation.save();
    res.status(201).json(conversation);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi gửi tin nhắn" });
  }
};
