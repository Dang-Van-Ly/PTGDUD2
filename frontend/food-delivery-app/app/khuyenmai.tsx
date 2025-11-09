import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Promotion, getValidPromotions} from "../data/dataService";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function SelectOfferScreen() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
const { orderId, subtotal, paymentMethod, restaurantId } = useLocalSearchParams<{
  orderId?: string;
  subtotal?: string;
  paymentMethod?: string;
  restaurantId?: string;
}>();
  const router = useRouter();
  const [selectedPromos, setSelectedPromos] = useState<{
    app: string | null;
    restaurant: string | null;
  }>({
    app: null,
    restaurant: null,
  });
  const [search, setSearch] = useState("");

  // 🔹 Lấy toàn bộ khuyến mãi (kể cả chưa đủ điều kiện)
useEffect(() => {
  const promos = getValidPromotions(
    Number(subtotal) || 0,
    "all",
    paymentMethod as string | undefined,
    restaurantId as string | undefined
  ) as Promotion[];
  setPromotions(promos);
}, [subtotal, paymentMethod, restaurantId]);


  // 🔹 Hàm kiểm tra xem khuyến mãi có đủ điều kiện không
const isPromoEligible = (promo: Promotion) => {
  const subtotalValue = Number(subtotal) || 0;
  const now = new Date();
  const from = new Date(promo.validFrom);
  const to = new Date(promo.validTo);
  to.setHours(23, 59, 59, 999);

  const isInDateRange = now >= from && now <= to;

  const isOrderEnough =
    !promo.condition.minOrder || subtotalValue >= promo.condition.minOrder;

  const isPaymentMatch =
    !promo.condition.paymentMethod || promo.condition.paymentMethod === paymentMethod;

  const isRestaurantMatch =
    promo.type === "app" || promo.restaurantId === restaurantId;

  return isInDateRange && isOrderEnough && isPaymentMatch && isRestaurantMatch;
};


  // 🔹 Lọc theo ô tìm kiếm
  const filteredPromos = promotions.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  // 🔹 Hiển thị loại giảm giá
  const renderDiscount = (discount: Promotion["discount"]) => {
    switch (discount.type) {
      case "freeship":
        return "Freeship";
      case "percent":
        return `-${discount.value}%`;
      case "paymentMethod":
        return `-${discount.value}% for ${discount.value}`;
      default:
        return "";
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>All Promotions</Text>

    {/* 👇 Hiển thị các tham số truyền sang để kiểm tra */}
    <View style={{ marginBottom: 10 }}>
      <Text>Subtotal: {subtotal}</Text>
      <Text>Payment Method: {paymentMethod}</Text>
      <Text>Restaurant ID: {restaurantId}</Text>
    </View>
      <TextInput
        style={styles.searchBox}
        placeholder="Search for voucher..."
        value={search}
        onChangeText={setSearch}
      />

      <FlatList
        data={filteredPromos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isEligible = isPromoEligible(item);
          const isSelected = selectedPromos[item.type] === item.id;

          return (
            <TouchableOpacity
              style={[
                styles.card,
                isSelected && styles.cardSelected,
                !isEligible && { opacity: 0.4 },
              ]}
              disabled={!isEligible}
              onPress={() =>
                setSelectedPromos((prev) => ({
                  ...prev,
                  [item.type]: prev[item.type] === item.id ? null : item.id,
                }))
              }
            >
              <View style={styles.row}>
                <Ionicons
                  name={
                    item.discount.type === "freeship"
                      ? "bicycle-outline"
                      : "pricetag-outline"
                  }
                  size={24}
                  color="#0ABAB5"
                  style={{ marginRight: 8 }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.discountText}>
                    {renderDiscount(item.discount)}
                  </Text>
                  <Text style={styles.desc}>{item.title}</Text>
                  <Text style={styles.desc}>
                    HSD: {item.validTo.replace("2025-", "")}
                  </Text>
                  {!isEligible && (
                    <Text style={[styles.desc, { color: "red" }]}>
                      (Không đủ điều kiện)
                    </Text>
                  )}
                </View>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={22} color="#0ABAB5" />
                )}
              </View>
            </TouchableOpacity>
          );
        }}
      />
<TouchableOpacity
  style={[
    styles.button,
    !selectedPromos.app && !selectedPromos.restaurant && styles.buttonDisabled,
  ]}
  disabled={!selectedPromos.app && !selectedPromos.restaurant}
  onPress={() => {
    if (!orderId) return;

    // Lọc các promo đã chọn
    const chosenPromos = promotions.filter(
      (p) => selectedPromos[p.type] === p.id
    );

    // Tính tổng tiền giảm
    const totalDiscount = chosenPromos.reduce(
      (sum, promo) => sum + (promo.discountAmount || 0),
      0
    );

    console.log("✅ Dùng mã:", selectedPromos);
    console.log("💰 Tổng tiền giảm:", totalDiscount);

    // Quay lại trang OrderDetail và truyền discount + selectedPromos
  // Khi nhấn "Use now"
router.replace(
  `/orders/${orderId}?discount=${totalDiscount}`
);


  }}
>
  <Text style={styles.buttonText}>Use now</Text>
</TouchableOpacity>


    </View>
  );
}

// 🎨 Style
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
    marginTop: 28,
  },
  searchBox: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  card: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  cardSelected: {
    borderColor: "#0ABAB5",
    backgroundColor: "#E6FFFA",
  },
  row: { flexDirection: "row", alignItems: "center" },
  discountText: { fontSize: 16, fontWeight: "600" },
  desc: { color: "#555", fontSize: 13 },
  button: {
    backgroundColor: "#0ABAB5",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 35,
  },
  buttonDisabled: {
    backgroundColor: "#ccc",

  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" ,},
});
