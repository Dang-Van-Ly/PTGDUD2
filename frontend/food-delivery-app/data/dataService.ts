import AsyncStorage from "@react-native-async-storage/async-storage";
import { ImageSourcePropType } from "react-native";
import { carts, orders, products, restaurantImages, restaurants, reviews, users, promotions, ordersMock } from "./mockData";
import axios from "axios";
import { API_URL } from "../app/(tabs)/home";

// 🧾 Interface chuẩn cho Promotion
export interface Promotion {
  id: string;
  type: "app" | "restaurant";
  restaurantId: string | null;
  discount: { type: string; value: any };
   condition: {                   
    minOrder?: number;
    paymentMethod?: string;
    userType?: string;
  };
  validFrom: string;
  validTo: string;
  title: string;
  description: string;
  discountAmount?: number; // Số tiền giảm giá tính toán được
}
// 🔹 Lấy tất cả nhà hàng
export const getAllRestaurants = async () => {
  try {
    const res = await axios.get(`${API_URL}/restaurants`);
    return res.data;
  } catch (error) {
    console.error("❌ getAllRestaurants error:", error);
    return [];
  }
};

export const getAllRestaurantsImg = () => {
  return restaurantImages;
};

// 2️⃣ Lấy tất cả món ăn của 1 nhà hàng
export const getProductsByRestaurantId = (restaurantId: string) => {
  return products
    .filter((product) => product.restaurant_id === restaurantId)
    .map(normalizeProduct);
};

// 3️⃣ Lấy chi tiết 1 món ăn

export async function getProductDetails(  id: string) {
  try {
    const res = await fetch(`${API_URL}/products/${id}`);
    if (!res.ok) throw new Error("Không tìm thấy sản phẩm");
    return await res.json();
  } catch (err) {
    console.error("Lỗi khi tải sản phẩm:", err);
    return null;
  }
}

// Chuẩn hóa product
function normalizeProduct(product: any) {
  const p = { ...product };
  if (!p.options || p.options.length === 0) {
    const cat = (p.category || "").toLowerCase();
    if (/(trà|nước|sinh tố|juice|detox|nước ép)/i.test(cat)) {
      p.options = [
        {
          name: "Đá",
          choices: [
            { name: "Ít đá", additionalPrice: 0 },
            { name: "Bình thường", additionalPrice: 0 },
            { name: "Không đá", additionalPrice: 0 },
          ],
        },
        {
          name: "Độ ngọt",
          choices: [
            { name: "100%", additionalPrice: 0 },
            { name: "70%", additionalPrice: 0 },
            { name: "50%", additionalPrice: 0 },
            { name: "Không đường", additionalPrice: 0 },
          ],
        },
      ];
    } else if (/(combo|cơm|burger|salad|gà|ăn kèm)/i.test(cat)) {
      p.options = [
        {
          name: "Size",
          choices: [
            { name: "Tiêu chuẩn", additionalPrice: 0 },
            { name: "Lớn", additionalPrice: 10000 },
          ],
        },
      ];
    } else {
      p.options = [
        {
          name: "Size",
          choices: [{ name: "Tiêu chuẩn", additionalPrice: 0 }],
        },
      ];
    }
  }
  if (!p.addons) p.addons = [];
  return p;
}

// 🏪 Lấy ảnh nhà hàng theo ID
export const getRestaurantImageById = (
  restaurantId: string
): ImageSourcePropType | null => {
  return restaurantImages[restaurantId] || null;
};

// 👤 Login user
export const loginUser = (sdt: string, matKhau: string) => {
  const user = users.find((u) => u.sdt === sdt && u.matKhau === matKhau);
  return user || null;
};

// 👥 Lấy tất cả user
export const getAllUsers = () => {
  return [...users];
};

// ⭐ Lấy review của 1 nhà hàng
export const getReviewsByRestaurantId = (restaurantId: string) => {
  const restaurantReviews = reviews.filter(
    (r) => r.restaurant_id === restaurantId
  );

  return restaurantReviews.map((review) => {
    const user = users.find(
      (u) => u.id.toLowerCase() === review.user_id.toLowerCase()
    );
    return {
      ...review,
      user: {
        name: user?.hoTen || "Ẩn danh",
        avatar: user?.hinhAnh || require("../assets/images/avatar.png"),
      },
    };
  });
};

// ⭐ Tính rating trung bình
export const getAverageRatingByRestaurantId = (restaurantId: string) => {
  const restaurantReviews = reviews.filter(
    (r) => r.restaurant_id === restaurantId
  );
  if (restaurantReviews.length === 0) return 0;
  const total = restaurantReviews.reduce((sum, r) => sum + r.rating, 0);
  return parseFloat((total / restaurantReviews.length).toFixed(1));
};

// 🛒 ✅ LẤY CART VÀ ORDERS CỦA USER
export const getCartByUser = async (userId: string) => {
  try {
    // 🔹 Đọc lại dữ liệu thực từ AsyncStorage
    const cartsData = await AsyncStorage.getItem("carts");
    const ordersData = await AsyncStorage.getItem("orders");

    const storedCarts = cartsData ? JSON.parse(cartsData) : carts;
    const storedOrders = ordersData ? JSON.parse(ordersData) : orders;

    // 🔹 Tìm cart của user
    const cart = storedCarts.find((c: any) => c.userId === userId);
    if (!cart) return null;

    // 🔹 Lọc order thuộc user
    const userOrders = storedOrders
      .filter((o: any) => o.userId === userId)
      .map((o: any) => {
        const restaurant = restaurants.find((r) => r.id === o.idRestaurant);
        const image =
          restaurantImages[o.idRestaurant as keyof typeof restaurantImages] ||
          null;
        const itemCount =
          o.items?.reduce((sum: number, i: any) => sum + i.quantity, 0) || 0;

        return {
          ...o,
          restaurant: restaurant
            ? {
                ...restaurant,
                image_url: image,
              }
            : {
                id: null,
                name: "Chưa chọn nhà hàng",
                estimated_delivery_time: 0,
                rating: 0,
                delivery_fee: 0,
                image_url: require("../assets/images/br1.jpg"),
              },
          itemCount,
        };
      });

    return {
      ...cart,
      orders: userOrders,
    };
  } catch (error) {
    console.error("❌ Lỗi khi đọc cart từ AsyncStorage:", error);
    return null;
  }
};
// 🛒 Thêm item vào order của cart hiện tại
export const addItemToCurrentOrder = (
  userId: string,
  productId: string,
  quantity: number,
  note: string = ""
) => {
  const cart = carts.find((c) => c.userId === userId);
  if (!cart) {
    console.warn("❌ Không tìm thấy giỏ hàng của user:", userId);
    return null;
  }

  const product = products.find((p) => p.id === productId);
  if (!product) {
    console.warn("❌ Không tìm thấy sản phẩm:", productId);
    return null;
  }

  const restaurantId = product.restaurant_id;
  if (!restaurantId) {
    console.warn("❌ Sản phẩm không có thông tin nhà hàng:", product);
    return null;
  }

  // Tìm order hiện tại (chưa đặt) của cùng nhà hàng trong giỏ hàng
  let order = orders.find(
    (o) =>
      o.idCart === cart.id &&
      o.idRestaurant === restaurantId &&
      o.status === "chua_dat"
  );

  // Nếu chưa có order thì tạo mới
  if (!order) {
    order = {
      id: `o${(orders.length + 1).toString().padStart(3, "0")}`,
      idCart: cart.id,
      idRestaurant: restaurantId,
      userId,
      status: "chua_dat",
      total: 0,
      createdAt: new Date().toISOString(),
      items: [],
    };
    orders.push(order);
  }

  // Đảm bảo mảng items tồn tại
  if (!Array.isArray(order.items)) {
    order.items = [];
  }

  // Kiểm tra xem sản phẩm đã tồn tại trong items chưa
  const existingItem = order.items.find((i) => i.idProduct === productId);

  if (existingItem) {
    existingItem.quantity += quantity;
    existingItem.subtotal = existingItem.quantity * product.price;
  } else {
   // ép kiểu cho order.items để tránh lỗi TS
(order.items as any[]).push({
  idProduct: productId,
  quantity,
  note,
  price: product.price,
  subtotal: product.price * quantity,
});

  }

  // Cập nhật tổng tiền của order
  order.total = order.items.reduce((sum, i) => sum + i.subtotal, 0);

  // Cập nhật tổng tiền của cart
  cart.total = orders
    .filter((o) => o.idCart === cart.id)
    .reduce((sum, o) => sum + o.total, 0);

// 🔹 Lưu lại toàn bộ orders và carts vào AsyncStorage
 AsyncStorage.setItem("orders", JSON.stringify(orders));
AsyncStorage.setItem("carts", JSON.stringify(carts));

console.log("✅ Đã thêm sản phẩm vào order:", order);
return order;
};
// 🔹 Lấy order theo id
export const getOrderById = async (id: string) => {
  try {
    const res = await fetch(`${API_URL}/${id}`);
    if (!res.ok) throw new Error("Không lấy được đơn hàng");
    const orderData = await res.json();

    // 🔹 Lấy chi tiết sản phẩm
    const itemsWithDetails = await Promise.all(
      orderData.items.map(async (item: any) => {
        const product = await getProductDetails(item.idProduct).catch(() => null);
        if (!product) console.warn(`⚠️ Sản phẩm không tồn tại: ${item.idProduct}`);
        return { ...item, product: product || null, subtotal: (item.quantity || 1) * (product?.price || 0) };
      })
    );

    return { ...orderData, items: itemsWithDetails };
  } catch (err) {
    console.error("❌ Lỗi getOrderById:", err);
    return null;
  }
};

// �️ Xóa item khỏi order
export const removeItemFromOrder = async (
  userId: string,
  orderId: string,
  productId: string
) => {
  try {
    // 🔹 Lấy dữ liệu orders và carts từ AsyncStorage
    const ordersData = await AsyncStorage.getItem("orders");
    const cartsData = await AsyncStorage.getItem("carts");

    const storedOrders = ordersData ? JSON.parse(ordersData) : orders;
    const storedCarts = cartsData ? JSON.parse(cartsData) : carts;

    // 🔹 Tìm order theo orderId
    const order = storedOrders.find((o: any) => o.id === orderId && o.userId === userId);
    if (!order) {
      console.warn("❌ Không tìm thấy order:", orderId);
      return null;
    }

    // 🔹 Xóa item khỏi order
    order.items = order.items.filter((i: any) => i.idProduct !== productId);

    // 🔹 Cập nhật tổng tiền order
    order.total = order.items.reduce((sum: number, i: any) => sum + i.subtotal, 0);

    // 🔹 Cập nhật tổng tiền cart
    const cart = storedCarts.find((c: any) => c.userId === userId);
    if (cart) {
      cart.total = storedOrders
        .filter((o: any) => o.idCart === cart.id)
        .reduce((sum: number, o: any) => sum + o.total, 0);
    }

    // 🔹 Lưu lại AsyncStorage
    await AsyncStorage.setItem("orders", JSON.stringify(storedOrders));
    await AsyncStorage.setItem("carts", JSON.stringify(storedCarts));

    console.log("✅ Đã xóa sản phẩm khỏi order:", productId);
    return order;
  } catch (error) {
    console.error("❌ Lỗi khi xóa item khỏi order:", error);
    return null;
  }
};
export const updateItemInOrder = async (
  userId: string,
  orderId: string,
  itemId: string,
  quantity: number,
  note: string
) => {
  try {
    const ordersData = await AsyncStorage.getItem("orders");
    const cartsData = await AsyncStorage.getItem("carts");

    const storedOrders = ordersData ? JSON.parse(ordersData) : [];
    const storedCarts = cartsData ? JSON.parse(cartsData) : [];

    // 🔹 Tìm order của user
    const order = storedOrders.find(
      (o: any) => o.id === orderId && o.userId === userId
    );
    if (!order) {
      console.warn("❌ Không tìm thấy order:", orderId);
      return null;
    }

    // 🔹 Cập nhật item trong order
    order.items = order.items.map((item: any) =>
      String(item.idProduct) === String(itemId)
        ? {
            ...item,
            quantity,
            note,
            subtotal: (item.price || 0) * quantity,
          }
        : item
    );

    // 🔹 Tính lại tổng tiền
    order.total = order.items.reduce(
      (sum: number, i: any) => sum + (i.subtotal || 0),
      0
    );

    // 🔹 Cập nhật tổng tiền cart tương ứng
    const cart = storedCarts.find((c: any) => c.userId === userId);
    if (cart) {
      cart.total = storedOrders
        .filter((o: any) => o.idCart === cart.id)
        .reduce((sum: number, o: any) => sum + o.total, 0);
    }

    // 🔹 Lưu lại
    await AsyncStorage.setItem("orders", JSON.stringify(storedOrders));
    await AsyncStorage.setItem("carts", JSON.stringify(storedCarts));

    console.log("✅ Đã cập nhật sản phẩm trong order:", orderId);
    return order;
  } catch (error) {
    console.error("❌ Lỗi updateItemInOrder:", error);
    return null;
  }
};
// 🔹 Lấy đơn hàng hiện tại (status = "chua_dat") của user
export const getCurrentOrder = async (userId: string) => {
  try {
    // 🔹 Đọc dữ liệu từ AsyncStorage, nếu không có thì dùng mockData
    const ordersData = await AsyncStorage.getItem("orders");
    const storedOrders = ordersData ? JSON.parse(ordersData) : orders;

    // 🔹 Tìm đơn hàng đang mở (chưa đặt) của user
    const currentOrder = storedOrders.find(
      (o: any) => o.userId === userId && o.status === "chua_dat"
    );
    if (!currentOrder) return null;

    // 🔹 Lấy thông tin nhà hàng
    const restaurant = restaurants.find((r) => r.id === currentOrder.idRestaurant);
    const image =
      restaurantImages[
        currentOrder.idRestaurant as keyof typeof restaurantImages
      ] || null;

    // 🔹 Tính tổng số lượng món
    const itemCount =
      currentOrder.items?.reduce((sum: number, i: any) => sum + i.quantity, 0) || 0;

    // ✅ Trả về dữ liệu chi tiết
    return {
      ...currentOrder,
      restaurant: restaurant
        ? { ...restaurant, image_url: image }
        : {
            id: null,
            name: "Chưa chọn nhà hàng",
            estimated_delivery_time: 0,
            rating: 0,
            delivery_fee: 0,
            image_url: require("../assets/images/br1.jpg"),
          },
      itemCount,
    };
  } catch (error) {
    console.error("❌ Lỗi khi lấy đơn hàng hiện tại:", error);
    return null;
  }
};
// xóa item trong đơn hàng 
//lấy tất cả khuyến mãi 
export const getAllPromotions = () => {
  return [...promotions];
}
//lấy khuyến mãi theo type
export const getPromotionsByType = (type: string) => {
  return promotions.filter((promo) => promo.type === type);
};
// dataService.ts
export const getValidPromotions = (
  subtotal: number = 0,
  userType: string = "all",
  paymentMethod?: string,
  restaurantId?: string
) => {
  const now = new Date();

  return promotions
    .map((promo) => {
      const from = new Date(promo.validFrom);
      const to = new Date(promo.validTo);
      to.setHours(23, 59, 59, 999);

      const minOrder = Number(promo.condition?.minOrder || 0);

      // 1️⃣ Kiểm tra thời gian
      const isInDateRange = now >= from && now <= to;

      // 2️⃣ Kiểm tra subtotal
      const isOrderEnough = subtotal >= minOrder;

      // 3️⃣ Kiểm tra paymentMethod
      const isPaymentMatch =
        !promo.condition?.paymentMethod || promo.condition.paymentMethod === paymentMethod;

      // 4️⃣ Kiểm tra nhà hàng
      let isRestaurantMatch = true;
      if (promo.type === "restaurant") {
        if (restaurantId) {
          isRestaurantMatch = promo.restaurantId === restaurantId;
        } else {
          // nếu không có restaurantId, promo restaurant không được chọn
          isRestaurantMatch = false;
        }
      }

      return {
        ...promo,
        isEligible: isInDateRange && isOrderEnough && isPaymentMatch && isRestaurantMatch,
      };
    })
    .sort((a, b) => {
      // Các promo đủ điều kiện (isEligible = true) lên đầu
      if (a.isEligible && !b.isEligible) return -1;
      if (!a.isEligible && b.isEligible) return 1;
      return 0;
    });
};
// 🔹 Lấy đơn hàng của user theo userId và chỉ lọc trạng thái đã giao / đang giao / đã hủy
export const getOrdersByUserId = async (userId: string) => {
  try {
    const stored = await AsyncStorage.getItem("orders");
    const allOrders = stored ? JSON.parse(stored) : orders;

    // Lọc theo userId
    const userOrders = allOrders.filter(
      (o: any) =>
        o.userId === userId &&
        ["dang_giao", "da_giao", "da_huy"].includes(o.status)
    );

    return userOrders;
  } catch (error) {
    console.error("❌ Lỗi khi lấy đơn hàng của user:", error);
    return [];
  }
};

export const getValidPromotionsByType = async (type: "app" | "restaurant") => {
  const now = new Date();
  const validPromos = promotions.filter((p) => {
    const from = new Date(p.validFrom);
    const to = new Date(p.validTo);
    to.setHours(23, 59, 59, 999);
    return p.type === type && now >= from && now <= to;
  });
  return validPromos;
};
// 📦 Lấy tất cả đơn hàng chưa được shipper nhận
export const getUnacceptedOrders = async () => {
  try {
    // Đọc dữ liệu đơn hàng từ AsyncStorage (nếu đã lưu)
    const stored = await AsyncStorage.getItem("ordersMock");
    const allOrders = stored ? JSON.parse(stored) : ordersMock;

    // Lọc ra đơn hàng chưa nhận (isAccepted = false)
    const unaccepted = allOrders.filter((o: any) => !o.isAccepted);
    return unaccepted;
  } catch (error) {
    console.error("❌ Lỗi khi lấy đơn hàng chưa nhận:", error);
    return [];
  }
};

// ✅ Tạo đơn hàng mới khi khách nhấn "Order Now"
export const addNewOrder = async (newOrder: any) => {
  try {
    // 1️⃣ Lấy danh sách đơn hiện có
    const stored = await AsyncStorage.getItem("ordersMock");
    const allOrders = stored ? JSON.parse(stored) : ordersMock;

    // 2️⃣ Thêm đơn mới (chưa được nhận)
    const orderToAdd = {
      id: Date.now().toString(), // tạo id tạm
      ...newOrder,
      isAccepted: false,
    };

    const updatedOrders = [...allOrders, orderToAdd];

    // 3️⃣ Lưu lại vào AsyncStorage
    await AsyncStorage.setItem("ordersMock", JSON.stringify(updatedOrders));

    console.log("✅ Thêm đơn hàng mới:", orderToAdd);
    return orderToAdd;
  } catch (error) {
    console.error("❌ Lỗi khi thêm đơn hàng:", error);
    return null;
  }
};

export async function getOrders() {
  try {
    const res = await fetch(`${API_URL}/orders`);
    if (!res.ok) throw new Error("Không thể tải danh sách đơn hàng");
    return await res.json();
  } catch (err) {
    console.error("Lỗi khi lấy đơn hàng:", err);
    return [];
  }
}
