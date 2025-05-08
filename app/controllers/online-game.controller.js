// app/controller/online-game.controller.js

import React, { useEffect, useState, useContext } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { SocketContext } from '../contexts/socket.context';
import Board from "../components/board/board.component";

const BG = '#0d1b2a';
const CARD_BG = '#1b263b';
const TEXT_COLOR = '#e0e1dd';
const BUTTON_BG = '#415a77';

export default function OnlineGameController({ navigation }) {
  const socket = useContext(SocketContext);

  const [inQueue, setInQueue] = useState(false);
  const [inGame, setInGame] = useState(false);
  const [idOpponent, setIdOpponent] = useState(null);

  useEffect(() => {
    socket.emit("queue.join");
    setInQueue(false);
    setInGame(false);

    socket.on('queue.added', data => {
      setInQueue(data.inQueue);
      setInGame(data.inGame);
    });

    socket.on('game.start', data => {
      setInQueue(data.inQueue);
      setInGame(data.inGame);
      setIdOpponent(data.idOpponent);
    });

    socket.on('queue.left', data => {
      setInQueue(data.inQueue);
      setInGame(data.inGame);
      navigation.navigate('HomeScreen');
    });
  }, [socket]);

  return (
    <View style={styles.container}>
      {!inQueue && !inGame && (
        <View style={styles.card}>
          <Text style={styles.text}>Waiting for server data...</Text>
        </View>
      )}

      {inQueue && (
        <View style={styles.card}>
          <Text style={styles.text}>Waiting for another player...</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => socket.emit("queue.leave")}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Quit queue</Text>
          </TouchableOpacity>
        </View>
      )}

      {inGame && <Board />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
    justifyContent: 'center',
    alignItems: 'center',
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
  text: {
    color: TEXT_COLOR,
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: BUTTON_BG,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  buttonText: {
    color: TEXT_COLOR,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
