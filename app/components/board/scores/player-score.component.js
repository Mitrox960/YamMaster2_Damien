// app/components/board/scores/player-score.component.js

import React, { useEffect, useState, useContext } from "react";
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { SocketContext } from '../../../contexts/socket.context';

const { width } = Dimensions.get('window');
const CARD_BG = '#1b263b';
const TEXT = '#e0e1dd';
const GAP = 8;

export default function PlayerScore() {
  const socket = useContext(SocketContext);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const handler = data => setScore(data.playerScore);
    socket.on('game.score', handler);
    return () => socket.off('game.score', handler);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Moi</Text>
      <Text style={styles.value}>{score}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: CARD_BG,
    padding: GAP,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: width * 0.27,
    marginHorizontal: GAP / 2,
  },
  label: {
    color: TEXT,
    fontSize: 20,
    marginBottom: 4,
  },
  value: {
    color: TEXT,
    fontSize: 24,
    fontWeight: 'bold',
  },
});