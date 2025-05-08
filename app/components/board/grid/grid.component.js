// app/components/board/grid/grid.component.js

import React, { useEffect, useContext, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SocketContext } from "../../../contexts/socket.context";

const CARD_BG = '#1b263b';
const TEXT = '#e0e1dd';
const SELECTABLE_BG = '#415a77';
const PLAYER1_BG = '#33415c';
const PLAYER2_BG = '#5c2e3f';

export default function Grid() {
  const socket = useContext(SocketContext);
  const [displayGrid, setDisplayGrid] = useState(false);
  const [grid, setGrid] = useState([]);

  useEffect(() => {
    const handler = data => {
      setDisplayGrid(data.displayGrid);
      setGrid(data.grid);
    };
    socket.on("game.grid.view-state", handler);
    return () => socket.off("game.grid.view-state", handler);
  }, [socket]);

  const onSelect = (cell, r, c) => {
    if (cell.canBeChecked) {
      socket.emit("game.grid.selected", { cellId: cell.id, rowIndex: r, cellIndex: c });
    }
  };

  if (!displayGrid) return null;

  return (
    <View style={styles.container}>
      {grid.map((row, r) => (
        <View key={r} style={styles.row}>
          {row.map((cell, c) => {
            const selectable = cell.canBeChecked && !cell.owner;
            let bg = CARD_BG;
            if (cell.owner === 'player:1') bg = PLAYER1_BG;
            else if (cell.owner === 'player:2') bg = PLAYER2_BG;
            else if (selectable) bg = SELECTABLE_BG;

            return (
              <TouchableOpacity
                key={`${r}-${c}-${cell.id}`}
                onPress={() => onSelect(cell, r, c)}
                disabled={!selectable}
                style={[styles.cell, { backgroundColor: bg }]}
                activeOpacity={0.8}
              >
                <Text style={styles.text}>{cell.viewContent}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '20%',
    backgroundColor: CARD_BG,
    borderRadius: 6,
    padding: 4,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  cell: {
    flex: 1,
    margin: 2,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: TEXT,
    fontSize: 12,
    fontWeight: '600',
  },
});