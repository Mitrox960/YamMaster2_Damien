// app/screens/game-summary.screen.js

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const BG = '#0d1b2a';
const CARD_BG = '#1b263b';
const TEXT_COLOR = '#e0e1dd';
const BUTTON_BG = '#415a77';

export default function GameSummaryScreen({ route, navigation }) {
  const {
    winner,
    isWinner,
    playerScore,
    opponentScore,
    playerTokens,
    opponentTokens,
  } = route.params || {};

  const displayWinner = () => {
    if (winner === 'draw') return 'Égalité';
    return isWinner ? 'Toi' : 'Adversaire';
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Résumé de la partie</Text>
        <Text style={styles.text}>Vainqueur : {displayWinner()}</Text>
        <Text style={styles.text}>Ton score : {playerScore}</Text>
        <Text style={styles.text}>Score adversaire : {opponentScore}</Text>
        <Text style={styles.text}>Tes pions restants : {playerTokens}</Text>
        <Text style={styles.text}>Pions adverses restants : {opponentTokens}</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('HomeScreen')}
        >
          <Text style={styles.buttonText}>Retour au menu</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
  title: {
    fontSize: 22,
    color: TEXT_COLOR,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    color: TEXT_COLOR,
    marginBottom: 8,
  },
  button: {
    marginTop: 20,
    backgroundColor: BUTTON_BG,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  buttonText: {
    color: TEXT_COLOR,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
