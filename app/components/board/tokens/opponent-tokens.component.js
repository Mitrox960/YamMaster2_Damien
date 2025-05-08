
// app/components/board/tokens/opponent-tokens.component.js

import React, { useEffect, useState, useContext } from "react";
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { SocketContext } from '../../../contexts/socket.context';

const { width: w } = Dimensions.get('window');
const CARD_BG = '#1b263b';
const TEXT = '#e0e1dd';
const GAP = 8;

export default function OpponentTokens() {
  const socket = useContext(SocketContext);
  const [tokens, setTokens] = useState(12);

  useEffect(() => {
    const handler = data => {
      if (data.opponentTokens !== undefined) {
        setTokens(data.opponentTokens);
      }
    };
    socket.on('game.tokens', handler);
    return () => socket.off('game.tokens', handler);
  }, [socket]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Pions Adv.</Text>
      <Text style={styles.value}>{tokens}</Text>
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
    width: w * 0.27,
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