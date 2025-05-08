// app/components/board/choices/choices.component.js

import React, { useState, useContext, useEffect } from "react";
import { View, TouchableOpacity, Text, StyleSheet, Dimensions } from "react-native";
import { SocketContext } from "../../../contexts/socket.context";

const { width } = Dimensions.get('window');
const CARD_BG = '#1b263b';
const BUTTON_BG = '#415a77';
const BUTTON_SELECTED_BG = '#26a69a';
const BUTTON_DISABLED_BG = '#33415c';
const TEXT = '#e0e1dd';
const GAP = 8;

export default function Choices() {
  const socket = useContext(SocketContext);
  const [displayChoices, setDisplayChoices] = useState(false);
  const [canMakeChoice, setCanMakeChoice] = useState(false);
  const [idSelectedChoice, setIdSelectedChoice] = useState(null);
  const [availableChoices, setAvailableChoices] = useState([]);

  useEffect(() => {
    const handler = data => {
      setDisplayChoices(data.displayChoices);
      setCanMakeChoice(data.canMakeChoice);
      setIdSelectedChoice(data.idSelectedChoice);
      setAvailableChoices(data.availableChoices);
    };
    socket.on("game.choices.view-state", handler);
    return () => socket.off("game.choices.view-state", handler);
  }, []);

  const handleSelect = id => {
    if (!canMakeChoice) return;
    setIdSelectedChoice(id);
    socket.emit("game.choices.selected", { choiceId: id });
  };

  if (!displayChoices) return null;

  return (
    <View style={styles.container}>
      {availableChoices.map(choice => {
        const selected = choice.id === idSelectedChoice;
        const disabled = !canMakeChoice;
        const bg = disabled
          ? BUTTON_DISABLED_BG
          : selected
          ? BUTTON_SELECTED_BG
          : BUTTON_BG;
        return (
          <TouchableOpacity
            key={choice.id}
            style={[styles.button, { backgroundColor: bg }]}
            onPress={() => handleSelect(choice.id)}
            disabled={disabled}
            activeOpacity={0.7}
          >
            <Text style={styles.text}>{choice.value}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: width * 0.9,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: GAP,
    backgroundColor: CARD_BG,
    borderRadius: 10,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    margin: GAP / 2,
    minWidth: (width * 0.9 - GAP * 4) / 3,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  text: {
    color: TEXT,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
