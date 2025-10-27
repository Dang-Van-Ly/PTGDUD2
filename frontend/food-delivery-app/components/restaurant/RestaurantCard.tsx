import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { getRestaurantImageById } from "../.././app/data/dataService";

export type Restaurant = {
  id: string;
  name?: string;
  description?: string;
  image_url?: string;
  estimated_delivery_time?: number;
  rating?: number;
  delivery_fee?: number;
};

type Props = {
  restaurant: Restaurant;
  onPress?: (r: Restaurant) => void;
};

export default function RestaurantCard({ restaurant, onPress }: Props) {
  return (
    <TouchableOpacity
      style={styles.restaurantCard}
      onPress={() => onPress?.(restaurant)}
      activeOpacity={0.8}
      
    >
      <Image
        source={getRestaurantImageById(restaurant.id) || { uri: restaurant.image_url }}
        style={styles.restaurantImg}
      />
      <View style={styles.restaurantInfo}>
        <Text style={styles.restaurantName}>{restaurant.name}</Text>
        <Text style={styles.restaurantDesc} numberOfLines={2}>
          {restaurant.description}
        </Text>
        <Text style={styles.restaurantMeta}>
          ⏱ {restaurant.estimated_delivery_time ?? "-"} • ⭐ {restaurant.rating ?? "-"}
        </Text>

        <View style={styles.badgeContainer}>
          {typeof restaurant.delivery_fee === "number" && restaurant.delivery_fee < 10000 && (
            <View style={[styles.badge, { backgroundColor: "#ff9800" }]}>
              <Text style={styles.badgeText}>Free ship</Text>
            </View>
          )}
          {typeof restaurant.estimated_delivery_time === "number" &&
            restaurant.estimated_delivery_time < 20 && (
              <View style={[styles.badge, { backgroundColor: "#00bcd4" }]}>
                <Text style={styles.badgeText}>Near you</Text>
              </View>
            )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  restaurantCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    marginHorizontal: 3,
    backgroundColor: "transparent",
  },
  restaurantImg: {
    width: 130,
    height: 95,
    borderRadius: 8,
  },
  restaurantInfo: {
    marginLeft: 12,
    flex: 1,
    padding: 5,
  },
  restaurantName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#222",
  },
  restaurantDesc: {
    fontSize: 12,
    color: "gray",
    marginBottom: 5,
  },
  restaurantMeta: {
    fontSize: 13,
    color: "#777",
  },
  badgeContainer: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 6 },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  badgeText: { fontSize: 11, color: "#fff", fontWeight: "600" },
});