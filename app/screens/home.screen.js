// app/screens/home.screen.js

import React from "react";
import { StyleSheet, View, Text, Pressable, Dimensions } from "react-native";

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎲 Yam Master</Text>
      <Text style={styles.subtitle}>Choisissez un mode de jeu</Text>

      <View style={styles.buttonsContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.buttonOnline,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => navigation.navigate("OnlineGameScreen")}
        >
          <Text style={styles.buttonText}>Jouer en ligne</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.buttonBot,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => navigation.navigate("VsBotGameScreen")}
        >
          <Text style={styles.buttonText}>Jouer contre le bot</Text>
        </Pressable>
      </View>
    </View>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d1b2a",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#e0e1dd",
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 40,
    color: "#778da9",
  },
  buttonsContainer: {
    width: "100%",
    alignItems: "center",
    gap: 20,
  },
  button: {
    width: width * 0.8,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 5,
  },
  buttonOnline: {
    backgroundColor: "#1b263b",
  },
  buttonBot: {
    backgroundColor: "#415a77",
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    fontSize: 18,
    color: "#e0e1dd",
    fontWeight: "600",
  },
});
