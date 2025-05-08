// app/screens/online-game.screen.js

import React, { useContext } from "react";
import { StyleSheet, View, Text } from "react-native";
import { SocketContext } from "../contexts/socket.context";
import OnlineGameController from "../controllers/online-game.controller";

const BG = '#0d1b2a';
const CARD_BG = '#1b263b';
const TEXT_COLOR = '#e0e1dd';

export default function OnlineGameScreen({ navigation }) {
  const socket = useContext(SocketContext);

  return (
    <View style={styles.container}>
      {!socket ? (
        <View style={styles.card}>
          <Text style={styles.title}>No connection with server...</Text>
          <Text style={styles.subtitle}>
            Restart the app and wait for the server to be back again.
          </Text>
        </View>
      ) : (
        <OnlineGameController navigation={navigation} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 10,
    padding: 20,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: TEXT_COLOR,
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: TEXT_COLOR,
    textAlign: "center",
  },
});
