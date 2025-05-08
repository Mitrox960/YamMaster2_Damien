# Yam Master – Projet ARCE842

**Yam Master** est une réinvention moderne du Yam’s en jeu multijoueur mobile. Intégré dans l’atelier **ARCE842 - Architecture Applicative**, ce projet met en œuvre une architecture client-serveur temps réel, une logique de jeu avancée et un mode de jeu contre une intelligence artificielle.

---

## Objectif du jeu

Marquer plus de points que son adversaire ou aligner 5 pions horizontalement, verticalement ou en diagonale pour une victoire immédiate.

---

## Règles principales

- **3 lancers de dés max** par tour.
- **Combinaisons réalisables** : Brelan, Full, Carré, Yam, Suite, ≤8, Sec, Défi.
- **Placement de pion** sur une case correspondant à la combinaison réussie.
- **Alignement** :
  - 3 pions : +1 point
  - 4 pions : +2 points
  - 5 pions : victoire instantanée

---

## Stack technique

### Frontend
- **Framework** : React Native (Expo)
- **Langage** : JavaScript (ES6+)
- **Navigation** : React Navigation
- **Sockets** : socket.io-client
- **Test / déploiement** : Web, Android emulator, ou mobile via QR Code Expo Go

### Backend
- **Langage** : Node.js
- **Serveur** : Express
- **Sockets** : socket.io
- **ID uniques** : uniqid

---

##  Architecture Backend

Le backend est un serveur WebSocket basé sur Express, responsable de :
- la gestion des files d’attente
- la création et gestion des parties
- le moteur de jeu (validation des dés, combinaisons, scoring)
- le mode joueur contre BOT

### Principales responsabilités :
- Communication temps réel avec les clients via WebSocket
- Mise à jour de l’état de jeu (deck, score, timer, grille)
- Calcul des points en fonction des alignements
- Envoi des mises à jour d’état sous forme de `view-state` aux clients

### API WebSocket – Contrats d’échange

**Événements reçus (client → serveur)** :
- `queue.join` / `queue.join-bot`
- `game.dices.roll`
- `game.dices.lock`
- `game.choices.selected`
- `game.grid.selected`

**Événements envoyés (serveur → client)** :
- `game.start`
- `game.timer`
- `game.end`
- `game.deck.view-state`
- `game.choices.view-state`
- `game.grid.view-state`
- `game.tokens`
- `game.score`

---

## Mode VS BOT

Le jeu intègre un **bot fonctionnel** :
- Simule les lancers et choix de combinaisons
- Sélectionne une cellule valide pour poser un pion
- Lorsqu'il n'a pas de combinaisons, il passe son tour.
- Respecte les mêmes règles que les joueurs humains

---

## Structure technique
/app 
  /components/board
    components
  board.component
  /contexts
  /controllers
  /screens
/backend
    index.js # WebSocket Server
    services/
      game.service.js # Moteur de jeu (deck, grille, scoring, etc.)


## Lancement du projet

Lancer la partie frontend expo en allant à la racine du projet. Ouvrir un CMD et tapez :
  - npm install
puis
  - npx expo start

Allez dans le dossier backend puis ouvrir un cmd et tapez :
  - npm install
  - npm start