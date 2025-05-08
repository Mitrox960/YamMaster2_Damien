// app/components/board/decks/dice.component.js

import React from "react";
import { TouchableOpacity, Text, StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get('window');
const DIE_SIZE = width * 0.025;
const DIE_BG = '#415a77';
const LOCKED_BG = '#33415c';
const TEXT = '#e0e1dd';

export default function Dice({ index, locked, value, onPress }) {
  return (
    <TouchableOpacity
      style={[
        styles.dice,
        { backgroundColor: locked ? LOCKED_BG : DIE_BG }
      ]}
      onPress={() => onPress(index)}
      activeOpacity={0.7}
    >
      <Text style={styles.text}>{value}</Text>
      {locked && <Text style={styles.lock}>🔒</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  dice: {
    width: DIE_SIZE,
    height: DIE_SIZE,
    borderRadius: DIE_SIZE * 0.15,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
    marginVertical: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  text: {
    color: TEXT,
    fontSize: DIE_SIZE * 0.8,
    fontWeight: 'bold',
  },
  lock: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    color: TEXT,
    fontSize: DIE_SIZE * 0.5,
  },
});
