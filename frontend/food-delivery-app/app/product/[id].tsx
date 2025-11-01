import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet, Image, ScrollView, Pressable, Platform, StatusBar } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getProductDetails,addItemToCurrentOrder } from "../../data/dataService";
import { BlurView } from "expo-blur";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const options = { headerShown: false };

interface SelectedChoice {
  optionIndex: number;
  choiceIndex: number;
}

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const product = getProductDetails(String(id));
  const [selectedAddons, setSelectedAddons] = useState<Set<number>>(new Set());
  const [selectedChoices, setSelectedChoices] = useState<SelectedChoice[]>([]);
  const [quantity, setQuantity] = useState(1);

  const totalPrice = useMemo(() => {
    let total = product?.price || 0;
    
    // Tính tổng tiền từ addons
    if (product?.addons) {
      product.addons.forEach((addon: any, index: number) => {
        if (selectedAddons.has(index)) {
          total += addon.price;
        }
      });
    }
    
    // Tính tổng tiền từ options
    if (product?.options) {
      product.options.forEach((option: any, optionIndex: number) => {
        option.choices.forEach((choice: any, choiceIndex: number) => {
          const isSelected = selectedChoices.some(
            sc => sc.optionIndex === optionIndex && sc.choiceIndex === choiceIndex
          );
          if (isSelected && choice.additionalPrice) {
            total += choice.additionalPrice;
          }
        });
      });
    }
    
    return total;
  }, [product, selectedAddons, selectedChoices]);

  if (!product) {
    return (
      <View style={styles.center}>
        <Text>Product not found</Text>
      </View>
    );
  }
const handleAddToCart = async () => {
  try {
    const userData = await AsyncStorage.getItem("currentUser");
    if (!userData) {
      alert("⚠️ Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng!");
      return;
    }

    const user = JSON.parse(userData);

    // Ghi chú (addons + options)
    const selectedAddonNames =
      product.addons
        ?.filter((_: any, i: number) => selectedAddons.has(i))
        .map((a: any) => a.name) || [];

    const selectedOptionNames =
      selectedChoices.map((sc) => {
        const opt = product.options?.[sc.optionIndex];
        const choice = opt?.choices?.[sc.choiceIndex];
        return `${opt?.name}: ${choice?.name || choice}`;
      }) || [];

    const note = [...selectedOptionNames, ...selectedAddonNames].join(", ");

    // 🛒 Gọi hàm thêm sản phẩm
    const order = addItemToCurrentOrder(user.id, product.id, quantity, note);

    if (order) {
      console.log("🛍 Order updated:", order);
      await AsyncStorage.setItem("cartUpdated", "true"); // 🔥 báo OrdersScreen reload
      alert("✅ Đã thêm vào giỏ hàng!");
      router.back(); // quay lại OrdersScreen
    } else {
      alert("❌ Thêm thất bại!");
    }
  } catch (error) {
    console.error("Lỗi thêm sản phẩm:", error);
  }
};

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} bounces={false}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: product.image_url }} style={styles.image} />
          <Pressable 
            style={[styles.backButton, styles.floatingButton]} 
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>
          <Pressable 
            style={[styles.favoriteButton, styles.floatingButton]}
          >
            <Ionicons name="heart-outline" size={24} color="#fff" />
          </Pressable>
        </View>

        <View style={styles.content}>
          <View style={styles.priceCard}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.rating}>{product.rating}</Text>
              <Text style={styles.ratingCount}>(200+)</Text>
            </View>
            <View>
              <Text style={styles.price}>${totalPrice.toLocaleString()}</Text>
              {selectedAddons.size > 0 && (
                <Text style={styles.originalPrice}>${product.price.toLocaleString()}</Text>
              )}
            </View>
          </View>

          <Text style={styles.title}>{product.name}</Text>
          <Text style={styles.desc}>{product.description}</Text>
          <Text style={styles.basePrice}>Base price</Text>

          {product.options?.length ? (
            <View style={styles.section}>
              {product.options.map((opt: any, i: number) => (
                <View key={i} style={styles.optionSection}>
                  <View style={styles.optionHeader}>
                    <Text style={styles.optionName}>{opt.name}</Text>
                    <Text style={styles.optionRequired}>(Pick 1)</Text>
                  </View>
                  <View style={styles.optionsContainer}>
                    {opt.choices.map((choice: any, j: number) => {
                      const isSelected = selectedChoices.some(
                        sc => sc.optionIndex === i && sc.choiceIndex === j
                      );
                      return (
                        <Pressable
                          key={j}
                          style={[
                            styles.optionRow,
                            isSelected && styles.selectedOptionRow
                          ]}
                          onPress={() => {
                            const currentSelection = selectedChoices.filter(
                              sc => sc.optionIndex !== i
                            );
                            if (!isSelected) {
                              currentSelection.push({ optionIndex: i, choiceIndex: j });
                            }
                            setSelectedChoices(currentSelection);
                          }}
                        >
                          <View style={styles.optionLeft}>
                            <View style={styles.radioButton}>
                              {isSelected && <View style={styles.radioButtonInner} />}
                            </View>
                            <Text style={styles.optionText}>
                              {typeof choice === 'string' ? choice : choice.name}
                            </Text>
                          </View>
                          {choice.additionalPrice > 0 && (
                            <Text style={styles.optionPrice}>+${choice.additionalPrice}</Text>
                          )}
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ))}
            </View>
          ) : null}

          {product.addons?.length ? (
            <View style={styles.section}>
              <View style={styles.optionHeader}>
                <Text style={styles.optionName}>Topping</Text>
                <Text style={styles.optionOptional}>(Optional)</Text>
              </View>
              <View style={styles.optionsContainer}>
                {product.addons.map((addon: any, i: number) => (
                  <Pressable 
                    key={i} 
                    style={styles.optionRow}
                    onPress={() => {
                      const newSelected = new Set(selectedAddons);
                      if (selectedAddons.has(i)) {
                        newSelected.delete(i);
                      } else {
                        newSelected.add(i);
                      }
                      setSelectedAddons(newSelected);
                    }}
                  >
                    <View style={styles.optionLeft}>
                      <View style={[
                        styles.checkbox,
                        selectedAddons.has(i) && styles.checkboxSelected
                      ]}>
                        {selectedAddons.has(i) && (
                          <Ionicons name="checkmark" size={16} color="#fff" />
                        )}
                      </View>
                      <Text style={styles.optionText}>{addon.name}</Text>
                    </View>
                    <Text style={styles.optionPrice}>+${addon.price.toLocaleString()}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}

          <View style={styles.bottomSpace} />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.quantityBox}>
          <View style={styles.quantityControl}>
            <Pressable 
              style={styles.quantityButton}
              onPress={() => setQuantity(prev => Math.max(1, prev - 1))}
            >
              <Ionicons name="remove" size={18} color="#333" />
            </Pressable>
            <Text style={styles.quantity}>{quantity}</Text>
            <Pressable 
              style={styles.quantityButton}
              onPress={() => setQuantity(prev => prev + 1)}
            >
              <Ionicons name="add" size={18} color="#333" />
            </Pressable>
          </View>
        </View>

   {/* 🔒 Nút thêm bị vô hiệu hóa khi chưa chọn đủ option */}
<Pressable
  style={[
    styles.addButton,
    (!product.options?.length || selectedChoices.length === product.options.length)
      ? null
      : { backgroundColor: "#ccc" } // đổi màu xám khi chưa đủ lựa chọn
  ]}
  disabled={product.options?.length && selectedChoices.length !== product.options.length}
  onPress={handleAddToCart}
>
  <Text style={styles.addButtonText}>
    {product.options?.length && selectedChoices.length !== product.options.length
      ? "Chọn đầy đủ tùy chọn trước"
      : `Thêm vào giỏ hàng ($${(totalPrice * quantity).toLocaleString()})`}
  </Text>
</Pressable>


      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  basePrice: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
  },
  optionSection: {
    marginBottom: 24,
  },
  optionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  optionRequired: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
  optionOptional: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
  checkbox: {
    width: 20,
    height: 20, 
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#ddd",
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center"
  },
  checkboxSelected: {
    backgroundColor: "#38E2FF",
    borderColor: "#38E2FF"
  },
  optionsContainer: {
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    overflow: "hidden",
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  selectedOptionRow: {
    backgroundColor: "#fff",
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#ddd",
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#38E2FF",
  },
  optionText: {
    fontSize: 15,
    color: "#333",
  },
  optionPrice: {
    fontSize: 14,
    color: "#38E2FF",
    fontWeight: "500",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  selectedAddonCard: {
    backgroundColor: "#FFF0F0",
    borderWidth: 1,
    borderColor: "#38E2FF",
  },
  checkmark: {
    position: 'absolute',
    right: 8,
    top: 8,
  },
  scrollView: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    height: 300,
    position: "relative",
    backgroundColor: "#000",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  floatingButton: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    top: Platform.OS === 'ios' ? 60 : (StatusBar.currentHeight || 24) + 10,
  },
  backButton: {
    left: 16,
  },
  favoriteButton: {
    right: 16,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
  },

  priceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },

  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rating: {
    marginLeft: 4,
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  ratingCount: {
    marginLeft: 4,
    color: "#666",
    fontSize: 14,
  },
  price: {
    fontSize: 20,
    fontWeight: "700",
    color: "#38E2FF",
  },
  originalPrice: {
    fontSize: 14,
    color: "#999",
    textDecorationLine: 'line-through',
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
    color: "#111",
  },
  desc: {
    fontSize: 15,
    color: "#666",
    lineHeight: 22,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    color: "#111",
  },
  optionCard: {
    backgroundColor: "#f8f8f8",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  optionName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  choicesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
  },
  choiceTag: {
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    margin: 4,
    borderWidth: 1,
    borderColor: "#eee",
  },
  choiceText: {
    fontSize: 14,
    color: "#666",
  },
  selectedChoiceTag: {
    backgroundColor: "#FFF0F0",
    borderColor: "#38E2FF",
  },
  selectedChoiceText: {
    color: "#38E2FF",
    fontWeight: "600",
  },
  choiceCheckmark: {
    position: "absolute",
    right: 8,
    top: "50%",
    transform: [{ translateY: -8 }],
  },
  addonsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
  },
  addonCard: {
    backgroundColor: "#f8f8f8",
    padding: 12,
    borderRadius: 12,
    margin: 6,
    width: "47%",
  },
  addonName: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 4,
    color: "#333",
  },
  addonPrice: {
    fontSize: 14,
    color: "#38E2FF",
    fontWeight: "600",
  },
  bottomSpace: {
    height: 140,
  },
  footer: {
    position: "absolute",
    // lift footer slightly above the very bottom so it doesn't feel flush to the edge
   bottom: 1,
    left: 12,
    right: 12,
    backgroundColor: "#fff",
    paddingVertical: 12,
    borderRadius: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    // stack vertically: quantity control on top, add button below
    flexDirection: "column",
    alignItems: "center",
    // subtle shadow/elevation
    height:160
   
  },
  footerLeft: {
    flex: 1,
    marginRight: 16,
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    borderRadius: 5,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: "center",
    justifyContent: "center",
    marginBottom: 4
  },
  quantityBox: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    
  },
  quantityButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    
  },
  quantity: {
    fontSize: 16,
    fontWeight: "600",
    marginHorizontal: 8,
    width: 28,
    textAlign: "center"
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: "#38E2FF"
  },
  addButton: {
    backgroundColor: "#38E2FF",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 5,
    alignItems: "center",
    width: '100%',
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
