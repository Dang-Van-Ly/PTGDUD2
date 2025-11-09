import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  id: String,
  name: String,
  phone: String,
  address: String,
  isDefault: Boolean,
  latitude: Number,
  longitude: Number,
});

const paymentMethodSchema = new mongoose.Schema({
  id: String,
  type: String,
  title: String,
  last4: String,
  isDefault: Boolean,
});

const userSchema = new mongoose.Schema({
  id: String,
  hoTen: String,
  sdt: String,
  matKhau: String,
  email: String,
  gioiTinh: String,
  ngaySinh: String,
  diaChi: String,
  hinhAnh: String, // bạn có thể lưu path ảnh (frontend require sẽ bỏ qua)
  role: { type: String, enum: ["customer", "shipper", "admin"], default: "customer" },
  addrs: [addressSchema],
  paymentMethods: [paymentMethodSchema],
});

const User = mongoose.model("User", userSchema);
export default User;
