// app/components/board/decks/player-deck.component.js

import React, { useState, useContext, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import { SocketContext } from '../../../contexts/socket.context';
import Dice from './dice.component';

const { width } = Dimensions.get('window');
const CONTAINER_WIDTH = width * 0.9;
const BUTTON_BG = '#26a69a';
const BUTTON_DISABLED_BG = '#415a77';
const TEXT_COLOR = '#e0e1dd';
const CARD_BG = '#1b263b';
const GAP = 8;

export default function PlayerDeck() {
  const socket = useContext(SocketContext);
  const [visible, setVisible] = useState(false);
  const [dices, setDices] = useState([]);
  const [canRoll, setCanRoll] = useState(false);
  const [rollsCounter, setRollsCounter] = useState(0);
  const [rollsMaximum, setRollsMaximum] = useState(3);

  useEffect(() => {
    const handler = data => {
      setVisible(data.displayPlayerDeck);
      setCanRoll(data.displayRollButton);
      setRollsCounter(data.rollsCounter);
      setRollsMaximum(data.rollsMaximum);
      setDices(data.dices);
    };
    socket.on('game.deck.view-state', handler);
    return () => socket.off('game.deck.view-state', handler);
  }, []);

  const onPressDice = index => {
    if (visible && canRoll) socket.emit('game.dices.lock', dices[index].id);
  };

  const onRoll = () => {
    if (canRoll) socket.emit('game.dices.roll');
  };

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.rollInfo}>
        <Text style={styles.rollText}>Lancer {rollsCounter-1} / {rollsMaximum}</Text>
      </View>

      <View style={styles.diceRow}>
        {dices.map((d, i) => (
          <Dice
            key={d.id}
            index={i}
            locked={d.locked}
            value={d.value}
            onPress={onPressDice}
          />
        ))}
      </View>

      <TouchableOpacity
        style={[
          styles.rollButton,
          { backgroundColor: canRoll ? BUTTON_BG : BUTTON_DISABLED_BG }
        ]}
        onPress={onRoll}
        disabled={!canRoll}
        activeOpacity={0.7}
      >
        <Text style={styles.rollButtonText}>Roll</Text>
      </TouchableOpacity>
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
  rollInfo: {
    marginBottom: GAP,
  },
  rollText: {
    color: TEXT_COLOR,
    fontSize: 14,
    fontStyle: 'italic',
  },
  diceRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4, // ou marginHorizontal sur chaque dé si `gap` ne fonctionne pas selon ta version de React Native
    width: '100%',
    marginBottom: GAP,
  },

  rollButton: {
    width: '40%',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  rollButtonText: {
    color: TEXT_COLOR,
    fontSize: 16,
    fontWeight: 'bold',
  },
});