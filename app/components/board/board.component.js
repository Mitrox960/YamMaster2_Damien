// app/components/board/board.component.js

import React, { useContext, useEffect } from "react";
import { View, StyleSheet, Dimensions } from 'react-native';
import PlayerTimer from './timers/player-timer.component';
import OpponentTimer from './timers/opponent-timer.component';
import PlayerDeck from "./decks/player-deck.component";
import OpponentDeck from "./decks/opponent-deck.component";
import PlayerScore from "./scores/player-score.component";
import OpponentScore from "./scores/opponent-score.component";
import PlayerTokens from "./tokens/player-tokens.component";
import OpponentTokens from "./tokens/opponent-tokens.component";
import Choices from "./choices/choices.component";
import Grid from "./grid/grid.component";
import { useNavigation } from '@react-navigation/native';
import { SocketContext } from '../../contexts/socket.context';

const { width } = Dimensions.get('window');
const GAP = 8;
const CARD_BG = '#1b263b';
const BG = '#0d1b2a';

export default function Board() {
  const navigation = useNavigation();
  const socket = useContext(SocketContext);

  useEffect(() => {
    const handleEnd = (data) => navigation.navigate('GameSummaryScreen', data);
    socket.on('game.end', handleEnd);
    return () => socket.off('game.end', handleEnd);
  }, [socket]);

  return (
    <View style={styles.container}>
      {/* Header: Opponent timer, score, tokens inline */}
      <View style={styles.headerRow}>
        <OpponentTimer />
        <OpponentScore />
        <OpponentTokens />
      </View>

      {/* Opponent Deck */}
      <View style={styles.section}>
        <OpponentDeck />
      </View>

      {/* Grid and Choices */}
      <View style={styles.gridSection}>
        <Grid />
      </View>
      <View style={styles.sectionChoices}>
        <Choices />
      </View>

      {/* Player Deck */}
      <View style={styles.section}>
        <PlayerDeck />
      </View>

      {/* Footer: Player timer, score, tokens inline */}
      <View style={styles.footerRow}>
        <PlayerTimer />
        <PlayerScore />
        <PlayerTokens />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
    padding: GAP,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    padding: GAP,
    borderRadius: 10,
    marginBottom: GAP,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    padding: GAP,
    borderRadius: 10,
    marginTop: GAP,
  },
  section: {
    backgroundColor: CARD_BG,
    borderRadius: 10,
    padding: GAP,
    marginVertical: GAP,
    alignItems: 'center',
  },
  gridSection: {
    flex: 3,
    backgroundColor: CARD_BG,
    borderRadius: 10,
    padding: GAP,
    marginVertical: GAP,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionChoices: {
    backgroundColor: CARD_BG,
    borderRadius: 10,
    padding: GAP,
    marginVertical: GAP,
  }
});