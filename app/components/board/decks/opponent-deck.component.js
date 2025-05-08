// app/components/board/decks/opponent-deck.component.js

import React, { useState, useContext, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { SocketContext } from '../../../contexts/socket.context';
import Dice from './dice.component';

const { width } = Dimensions.get('window');
const CONTAINER_WIDTH = width * 0.9;
const CARD_BG = '#1b263b';
const TEXT_COLOR = '#e0e1dd';
const GAP = 8;

export default function OpponentDeck() {
  const socket = useContext(SocketContext);
  const [visible, setVisible] = useState(false);
  const [dices, setDices] = useState([]);

  useEffect(() => {
    const handler = data => {
      setVisible(data.displayOpponentDeck);
      if (data.displayOpponentDeck) {
        setDices(data.dices);
      }
    };
    socket.on('game.deck.view-state', handler);
    return () => socket.off('game.deck.view-state', handler);
  }, []);

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.diceRow}>
        {dices.map((d, i) => (
          <Dice
            key={d.id || i}
            index={i}
            locked={d.locked}
            value={d.value}
            onPress={() => {}} // pas d’action pour l’adversaire
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CONTAINER_WIDTH,
    backgroundColor: CARD_BG,
    borderRadius: 10,
    padding: GAP,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    marginVertical: GAP,
  },
  diceRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    width: '100%',
  },
});
