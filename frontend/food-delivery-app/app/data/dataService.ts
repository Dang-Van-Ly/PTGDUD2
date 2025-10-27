import { restaurants, products ,restaurantImages, users,reviews} from "./mockData";
import { ImageSourcePropType } from 'react-native';

export function getAllRestaurants() {
  return [...restaurants]; // clone mảng, không làm thay đổi dữ liệu gốc
}


export const getAllRestaurantsImg = () => {
  return restaurantImages;
};

//2. Hàm lấy tất cả món ăn của một nhà hàng cụ thể
export const getProductsByRestaurantId = (restaurantId: string) => {
    // Mô phỏng việc lọc dữ liệu như query SQL/MongoDB
    return products.filter(product => product.restaurant_id === restaurantId);
};

// 3. Hàm lấy chi tiết một món ăn
export const getProductDetails = (productId: string) => {
    return products.find(product => product.id === productId);
};

// Hàm lấy ảnh của một nhà hàng theo id
export const getRestaurantImageById = (restaurantId: string): ImageSourcePropType | null => {
 return restaurantImages[restaurantId] || null;};

// 1️⃣ Hàm kiểm tra đăng nhập từ mockData
export const loginUser = (sdt: string, matKhau: string) => {
  console.log("Kiểm tra login:", sdt, matKhau); // 👈 Thêm dòng này
  const user = users.find((u) => u.sdt === sdt && u.matKhau === matKhau);
  console.log("Kết quả tìm được:", user); // 👈 Và dòng này
  return user || null;
};


// 2️⃣ Hàm lấy thông tin tất cả người dùng
export const getAllUsers = () => {
  return [...users];
};
// Lấy tất cả review của 1 nhà hàng
export const getReviewsByRestaurantId = (restaurantId: string) => {
  return reviews.filter(reviews=> reviews.restaurant_id === restaurantId);
}
//  Tính trung bình rating của 1 nhà hàng
export const getAverageRatingByRestaurantId = (restaurantId: string) => {
  const restaurantReviews = reviews.filter(r => r.restaurant_id === restaurantId);
  if (restaurantReviews.length === 0) return 0; // nếu chưa có review thì trả 0

  const total = restaurantReviews.reduce((sum, r) => sum + r.rating, 0);
  return parseFloat((total / restaurantReviews.length).toFixed(1)); // làm tròn 1 chữ số
};
