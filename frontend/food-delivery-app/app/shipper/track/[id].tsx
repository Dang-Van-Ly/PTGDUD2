import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../(tabs)/home"; 
import { useLocalSearchParams } from "expo-router";

type MessageType = {
  sender: "customer" | "user";
  text: string;
  timestamp: string;
};

export default function ChatScreen() {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [input, setInput] = useState("");
  const flatListRef = useRef<FlatList>(null);

  const params = useLocalSearchParams();
  const userId = params.userId as string;
  const idCustomer = params.idCustomer as string;

  const fetchMessages = async () => {
    if (!userId || !idCustomer) return;
    try {
      const res = await fetch(`${API_URL}/messages/${idCustomer}?userId=${userId}`);
      const data = await res.json();
      setMessages(data.messages || []);
      flatListRef.current?.scrollToEnd({ animated: true });
    } catch (err) {
      console.log("Lỗi fetch messages:", err);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [userId, idCustomer]);

  const sendMessage = async () => {
    if (!input.trim() || !userId || !idCustomer) return;

    try {
      const res = await fetch(`${API_URL}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: idCustomer,
          userId: userId,
          sender: "user",
          text: input.trim(),
        }),
      });

      const data = await res.json();
      setMessages(data.messages);
      setInput("");
      flatListRef.current?.scrollToEnd({ animated: true });
    } catch (err) {
      console.log("Lỗi gửi message:", err);
    }
  };

  const renderItem = ({ item }: { item: MessageType }) => {
    const isUser = item.sender === "user";
    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.messageRight : styles.messageLeft,
        ]}
      >
        <View style={[styles.bubble, isUser ? styles.userBubble : styles.customerBubble]}>
          <Text style={styles.messageText}>{item.text}</Text>
        </View>
        <Text style={styles.timestamp}>
          {new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#f7f7f7" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 10, paddingBottom: 20 }}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Nhập tin nhắn..."
        />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
          <Text style={{ color: "#fff", fontWeight: "700" }}>Gửi</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  messageContainer: {
    marginVertical: 4,
    maxWidth: "80%",
  },
  messageLeft: {
    alignSelf: "flex-start",
  },
  messageRight: {
    alignSelf: "flex-end",
  },
  bubble: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: "#00C2CF",
    borderTopRightRadius: 0,
  },
  customerBubble: {
    backgroundColor: "#e5e5ea",
    borderTopLeftRadius: 0,
  },
  messageText: {
    color: "#000",
    fontSize: 16,
  },
  timestamp: {
    fontSize: 10,
    color: "#999",
    marginTop: 2,
    alignSelf: "flex-end",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 8,
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    fontSize: 16,
  },
  sendBtn: {
    backgroundColor: "#00C2CF",
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginLeft: 8,
    borderRadius: 25,
  },
});
