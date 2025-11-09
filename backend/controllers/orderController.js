import Order from "../models/Order.js";
import Product from "../models/Product.js";

// Lấy tất cả orders, kèm chi tiết product và total
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find();

    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        const detailedItems = await Promise.all(
          order.items.map(async (item) => {
            const product = await Product.findOne({ id: item.idProduct });
            return {
              ...item.toObject(),
              product,
              subtotal: item.subtotal || ((item.quantity || 1) * (product?.price || 0)),
            };
          })
        );

        const total = detailedItems.reduce((sum, i) => sum + i.subtotal, 0);

        return {
          ...order.toObject(),
          items: detailedItems,
          total,
        };
      })
    );

    res.json(ordersWithDetails);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ id: req.params.id });
    if (!order) return res.status(404).json({ message: "Order not found" });

    // 🔹 Lấy chi tiết sản phẩm cho từng item
    const detailedItems = await Promise.all(
      order.items.map(async (item) => {
        const product = await Product.findOne({ id: item.idProduct });
        return {
          ...item.toObject(),
          product,
        };
      })
    );

    res.json({ ...order.toObject(), items: detailedItems });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// 🛒 Thêm sản phẩm vào đơn hàng hiện tại (chưa đặt)
export const addItemToOrder = async (req, res) => {
  try {
    const { userId, productId, quantity, note } = req.body;

    // 🔹 Kiểm tra sản phẩm tồn tại
    const product = await Product.findOne({ id: productId });
    if (!product)
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

    const restaurantId = product.restaurant_id;

    // 🔹 Tìm đơn hàng chưa đặt của cùng nhà hàng
    let order = await Order.findOne({
      userId,
      idRestaurant: restaurantId,
      status: "chua_dat",
    });

    // 🔹 Nếu chưa có thì tạo mới
    if (!order) {
      order = new Order({
        id: `o${Math.floor(Math.random() * 1000000)}`, // bạn có thể đổi thành auto tăng
        idCart: `c${userId}`,
        idRestaurant: restaurantId,
        userId,
        status: "chua_dat",
        total: 0,
        items: [],
      });
    }

    // 🔹 Tìm xem sản phẩm đã có trong items chưa
    const existingItem = order.items.find((i) => i.idProduct === productId);

    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.subtotal = existingItem.quantity * product.price;
    } else {
      order.items.push({
        idProduct: productId,
        quantity,
        note,
        subtotal: product.price * quantity,
      });
    }

    // 🔹 Cập nhật tổng tiền
    order.total = order.items.reduce((sum, i) => sum + i.subtotal, 0);

    await order.save();

    res.status(200).json({ message: "Đã thêm sản phẩm vào đơn hàng", order });
  } catch (err) {
    console.error("❌ Lỗi khi thêm sản phẩm:", err);
    res.status(500).json({ message: err.message });
  }
};
// 🛒 Cập nhật số lượng hoặc ghi chú sản phẩm trong đơn hàng


export const updateOrderItemQty = async (req, res) => {
  const { orderId, productId } = req.params;
  const { quantity } = req.body; // số lượng mới

  if (quantity < 0) return res.status(400).json({ message: "Quantity must be >= 0" });

  try {
    const order = await Order.findOne({ id: orderId });
    if (!order) return res.status(404).json({ message: "Order not found" });

    const itemIndex = order.items.findIndex(i => i.idProduct === productId);
    if (itemIndex === -1) return res.status(404).json({ message: "Item not found" });

    const item = order.items[itemIndex];

    if (quantity === 0) {
      // Xóa item nếu quantity = 0
      order.items.splice(itemIndex, 1);
    } else {
      // Cập nhật số lượng và subtotal dựa trên subtotal hiện tại
      const oldQty = item.quantity;
      const oldSubtotal = item.subtotal;

      item.quantity = quantity;
      item.subtotal = oldQty > 0 ? (oldSubtotal / oldQty) * quantity : 0;
    }

    // Cập nhật tổng tiền
    order.total = order.items.reduce((sum, i) => sum + i.subtotal, 0);

    await order.save();
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
// Cập nhật trạng thái đơn hàng thành "da_dat"
// PUT /orders/:orderId/status
export const updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body; // nhận trạng thái từ client

  try {
    const order = await Order.findOne({ id: orderId });
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status; // ví dụ: "dang_dao"
    await order.save();

    res.json({ message: "Order status updated", order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

