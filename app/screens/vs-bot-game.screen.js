// app/screens/vs-bot-game.screen.js

import React, { useContext, useEffect } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { SocketContext } from '../contexts/socket.context';
import Board from "../components/board/board.component";

const BG = '#0d1b2a';
const CARD_BG = '#1b263b';
const TEXT_COLOR = '#e0e1dd';
const BUTTON_BG = '#415a77';

export default function VsBotGameScreen({ navigation }) {
  const socket = useContext(SocketContext);

  useEffect(() => {
    if (socket) {
      socket.emit('queue.join-bot');
    }
  }, [socket]);

  return (
    <View style={styles.container}>
      {!socket ? (
        <View style={styles.messageBox}>
          <Text style={styles.paragraph}>No connection with server...</Text>
          <Text style={styles.footnote}>
            Restart the app and wait for the server to be back again.
          </Text>
        </View>
      ) : (
        <>
          <Board gameViewState="vsBot" />
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('HomeScreen')}
          >
            <Text style={styles.buttonText}>Revenir au menu</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageBox: {
    backgroundColor: CARD_BG,
    padding: 20,
    borderRadius: 8,
    width: '90%',
    alignItems: 'center',
  },
  paragraph: {
    fontSize: 18,
    fontWeight: "bold",
    color: TEXT_COLOR,
    marginBottom: 10,
    textAlign: 'center',
  },
  footnote: {
    fontSize: 13,
    color: '#a8b0b9',
    textAlign: "center",
  },
  button: {
    backgroundColor: BUTTON_BG,
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  buttonText: {
    color: TEXT_COLOR,
    fontWeight: 'bold',
    fontSize: 14,
  },
});
