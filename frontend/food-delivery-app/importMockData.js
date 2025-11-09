// importMockData.js
import { MongoClient } from "mongodb";
import { orders, restaurants, users } from "./data/mockData"; // đường dẫn tới mockData.ts

async function importData() {
  const uri = "mongodb://localhost:27017"; // MongoDB local, hoặc URI Atlas
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db("shopDB"); // tên database bạn muốn

    // ========== Orders ==========
    const ordersCol = db.collection("orders");
    await ordersCol.deleteMany({}); // xóa dữ liệu cũ
    const ordersToInsert = orders.map(order => ({
      ...order,
      createdAt: new Date(order.createdAt) // convert string sang Date
    }));
    await ordersCol.insertMany(ordersToInsert);
    console.log(`Đã import ${orders.length} orders`);

    // ========== Restaurants ==========
    if (restaurants) {
      const restCol = db.collection("restaurants");
      await restCol.deleteMany({});
      await restCol.insertMany(restaurants);
      console.log(`Đã import ${restaurants.length} restaurants`);
    }

    // ========== Users ==========
    if (users) {
      const usersCol = db.collection("users");
      await usersCol.deleteMany({});
      await usersCol.insertMany(users);
      console.log(`Đã import ${users.length} users`);
    }

    console.log("Import tất cả dữ liệu thành công!");
  } catch (err) {
    console.error("Lỗi khi import dữ liệu:", err);
  } finally {
    await client.close();
  }
}

importData();
