import { restaurants, products, restaurantImages, users, reviews, orders, carts } from "./mockData";
import { ImageSourcePropType } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function getAllRestaurants() {
  return [...restaurants];
}

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
export const getProductDetails = (productId: string) => {
  const p = products.find((product) => product.id === productId);
  return p ? normalizeProduct(p) : undefined;
};

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
export const getOrderById = async (orderId: string) => {
  try {
     // 🔹 Đọc orders từ AsyncStorage nếu có, fallback sang mockData
    const ordersData = await AsyncStorage.getItem("orders");
    const storedOrders = ordersData ? JSON.parse(ordersData) : orders;

    const order = storedOrders.find((o: any) => o.id === orderId);
    if (!order) return null;

    // 🔹 Lấy thông tin nhà hàng
    const restaurant = restaurants.find((r) => r.id === order.idRestaurant);
    const image =
      restaurantImages[order.idRestaurant as keyof typeof restaurantImages] ||
      null;

    // 🔹 Tính số món
    const itemCount =
      order.items?.reduce((sum: number, i: any) => sum + i.quantity, 0) || 0;

    return {
      ...order,
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
    console.error("❌ Lỗi khi lấy order theo id:", error);
    return null;
  }
};
// 🗑️ Xóa item khỏi order
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
