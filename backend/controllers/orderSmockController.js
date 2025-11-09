import OrderSmock from "../models/OrderSmock.js";

/**
 * 🧾 Lấy tất cả đơn hàng (OrderSmock)
 */
export const getAllOrderSmocks = async (req, res) => {
  try {
    const orders = await OrderSmock.find().sort({ createdAt: -1 }); // mới nhất trước
    res.status(200).json(orders);
  } catch (error) {
    console.error("❌ Lỗi lấy danh sách OrderSmock:", error);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách đơn hàng" });
  }
};

/**
 * 🛒 Tạo đơn hàng mới (OrderSmock)
 */
export const createOrderSmock = async (req, res) => {
  try {
    const {
      idCustomer,
      customer,
      phone,
      address,
      addressRestaurant,
      total,
      payment,
      items,
      isAccepted,
      storeLocation,
      customerLocation,
    } = req.body;

    // ⚠️ Kiểm tra dữ liệu đầu vào
    if (
      !idCustomer ||
      !customer ||
      !phone ||
      !address ||
      !addressRestaurant ||
      !total ||
      !payment ||
      !items?.length
    ) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }

    // 📦 Tạo mới đơn hàng
    const newOrder = new OrderSmock({
      idCustomer,
      customer,
      phone,
      address,
      addressRestaurant,
      total,
      payment,
      items,
      isAccepted: isAccepted || false,
      storeLocation,
      customerLocation,
    });

    const savedOrder = await newOrder.save();
    console.log("✅ Đã lưu OrderSmock:", savedOrder);

    res.status(201).json(savedOrder);
  } catch (error) {
    console.error("❌ Lỗi tạo OrderSmock:", error);
    res.status(500).json({ message: "Tạo OrderSmock thất bại", error: error.message });
  }
};
