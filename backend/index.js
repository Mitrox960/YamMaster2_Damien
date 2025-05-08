const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
var uniqid = require('uniqid');
const GameService = require('./services/game.service');

// ---------------------------------------------------
// -------- CONSTANTS AND GLOBAL VARIABLES -----------
// ---------------------------------------------------
let games = [];
let queue = [];

// ------------------------------------
// -------- EMITTER METHODS -----------
// ------------------------------------

const updateClientsViewTimers = (game) => {
  game.player1Socket.emit('game.timer', GameService.send.forPlayer.gameTimer('player:1', game.gameState));
  game.player2Socket.emit('game.timer', GameService.send.forPlayer.gameTimer('player:2', game.gameState));
};

const updateClientsViewScores = (game) => {
  game.player1Socket.emit('game.score', GameService.send.forPlayer.gameScore('player:1', game.gameState));
  game.player2Socket.emit('game.score', GameService.send.forPlayer.gameScore('player:2', game.gameState));
};

const updateClientsViewDecks = (game) => {
  setTimeout(() => {
    game.player1Socket.emit('game.deck.view-state', GameService.send.forPlayer.deckViewState('player:1', game.gameState));
    game.player2Socket.emit('game.deck.view-state', GameService.send.forPlayer.deckViewState('player:2', game.gameState));
  }, 200);
};

const updateClientsViewChoices = (game) => {
  setTimeout(() => {
    game.player1Socket.emit('game.choices.view-state', GameService.send.forPlayer.choicesViewState('player:1', game.gameState));
    game.player2Socket.emit('game.choices.view-state', GameService.send.forPlayer.choicesViewState('player:2', game.gameState));
  }, 200);
}

const updateClientsViewGrid = (game) => {
  setTimeout(() => {
    game.player1Socket.emit('game.grid.view-state', GameService.send.forPlayer.gridViewState('player:1', game.gameState));
    game.player2Socket.emit('game.grid.view-state', GameService.send.forPlayer.gridViewState('player:2', game.gameState));
  }, 200)
}

// ---------------------------------
// -------- GAME METHODS -----------
// ---------------------------------

const createGame = (player1Socket, player2Socket) => {
  // 1) Initialisation du nouveau game
  const newGame = GameService.init.gameState();
  newGame.idGame          = uniqid();
  newGame.player1Socket   = player1Socket;
  newGame.player2Socket   = player2Socket;
  // on force le joueur 1 à commencer
  newGame.gameState.currentTurn = 'player:1';
  newGame.gameState.timer       = GameService.timer.getTurnDuration();

  // 2) On stocke la partie
  games.push(newGame);
  const gameIndex = GameService.utils.findGameIndexById(games, newGame.idGame);
  const game      = games[gameIndex];

  // 3) On notifie le démarrage aux deux joueurs
  game.player1Socket.emit('game.start', GameService.send.forPlayer.viewGameState('player:1', game));
  game.player2Socket.emit('game.start', GameService.send.forPlayer.viewGameState('player:2', game));

  // 4) On envoie l’état initial (timer, scores, deck, grille)
  updateClientsViewTimers(game);
  updateClientsViewScores(game);
  updateClientsViewDecks(game);
  updateClientsViewGrid(game);

  // 5) On lance le timer (toutes les secondes)
  const gameInterval = setInterval(() => {
    // on décrémente toujours le timer
    game.gameState.timer--;
    updateClientsViewTimers(game);

    // quand le chrono arrive à 0 → changement de tour
    if (game.gameState.timer <= 0) {
      // on bascule le joueur courant
      game.gameState.currentTurn = game.gameState.currentTurn === 'player:1'
        ? 'player:2'
        : 'player:1';

      // reset de l’état pour le nouveau tour
      game.gameState.timer   = GameService.timer.getTurnDuration();
      game.gameState.deck    = GameService.init.deck();
      game.gameState.choices = GameService.init.choices();
      game.gameState.grid    = GameService.grid.resetcanBeCheckedCells(game.gameState.grid);

      // mise à jour des vues après bascule
      updateClientsViewTimers(game);
      updateClientsViewDecks(game);
      updateClientsViewChoices(game);
      updateClientsViewGrid(game);
    }
  }, 1000);

  // 6) On nettoie l’intervalle si un joueur se déconnecte
  player1Socket.on('disconnect', () => clearInterval(gameInterval));
  player2Socket.on('disconnect', () => clearInterval(gameInterval));
};

function createGameVsBot(playerSocket) {
  const newGame = GameService.init.gameState();
  newGame.idGame            = uniqid();
  newGame.player1Socket     = playerSocket;
  newGame.player2Socket     = { id: 'bot', emit: () => {} };
  newGame.botPlaying        = false;

  // Tour et timer
  newGame.gameState.currentTurn  = 'player:1';
  newGame.gameState.timer        = GameService.timer.getTurnDuration();

  // On ajoute la partie
  games.push(newGame);
  const gameIndex = GameService.utils.findGameIndexById(games, newGame.idGame);
  const game      = games[gameIndex];

  // Démarrage côté client
  playerSocket.emit('game.start', GameService.send.forPlayer.viewGameState('player:1', game));
  updateClientsViewTimers(game);
  updateClientsViewScores(game);
  updateClientsViewDecks(game);
  updateClientsViewGrid(game);

  // Timer global (1s) : on ne réagit qu'au tour du joueur humain
  const gameInterval = setInterval(() => {
    if (game.gameState.currentTurn !== 'player:1') return;

    game.gameState.timer--;
    updateClientsViewTimers(game);

    if (game.gameState.timer <= 0) {
      // Passe au bot
      finishHumanTurn(game);
      handleBotTurn(game);
    }
  }, 1000);

  playerSocket.on('disconnect', () => clearInterval(gameInterval));
}

function finishHumanTurn(game) {
  // réinitialise l'état pour le prochain tour (bot ou humain)
  game.gameState.currentTurn = (game.gameState.currentTurn === 'player:1')
    ? 'player:2'
    : 'player:1';

  game.gameState.timer    = GameService.timer.getTurnDuration();
  game.gameState.deck     = GameService.init.deck();
  game.gameState.choices  = GameService.init.choices();
  game.gameState.grid     = GameService.grid.resetcanBeCheckedCells(game.gameState.grid);

  updateClientsViewTimers(game);
  updateClientsViewDecks(game);
  updateClientsViewChoices(game);
  updateClientsViewGrid(game);
}

const newPlayerInQueue = (socket) => {

  queue.push(socket);

  // 'queue' management
  if (queue.length >= 2) {
    const player1Socket = queue.shift();
    const player2Socket = queue.shift();
    createGame(player1Socket, player2Socket);
  }
  else {
    socket.emit('queue.added', GameService.send.forPlayer.viewQueueState());
  }
};

// ---------------------------------------
// -------- SOCKETS MANAGEMENT -----------
// ---------------------------------------

io.on('connection', socket => {

  console.log(`[${socket.id}] socket connected`);

  socket.on('queue.join', () => {
    console.log(`[${socket.id}] new player in queue `)
    newPlayerInQueue(socket);
  });

  socket.on('queue.join-bot', () => {
    console.log(`[${socket.id}] player wants to play vs bot`);
  
    createGameVsBot(socket);
  });
  

  socket.on('game.dices.roll', () => {
    const gameIndex = GameService.utils.findGameIndexBySocketId(games, socket.id);

    if (games[gameIndex].gameState.deck.rollsCounter < games[gameIndex].gameState.deck.rollsMaximum) {
      // si ce n'est pas le dernier lancé

      // gestion des dés 
      games[gameIndex].gameState.deck.dices = GameService.dices.roll(games[gameIndex].gameState.deck.dices);
      games[gameIndex].gameState.deck.rollsCounter++;

      // gestion des combinaisons
      const dices = games[gameIndex].gameState.deck.dices;
      const isDefi = false;
      const isSec = games[gameIndex].gameState.deck.rollsCounter === 2;

      const combinations = GameService.choices.findCombinations(dices, isDefi, isSec);
      games[gameIndex].gameState.choices.availableChoices = combinations;

      // gestion des vues
      updateClientsViewDecks(games[gameIndex]);
      updateClientsViewChoices(games[gameIndex]);

    } else {
      // si c'est le dernier lancer

      // gestion des dés 
      games[gameIndex].gameState.deck.dices = GameService.dices.roll(games[gameIndex].gameState.deck.dices);
      games[gameIndex].gameState.deck.rollsCounter++;
      games[gameIndex].gameState.deck.dices = GameService.dices.lockEveryDice(games[gameIndex].gameState.deck.dices);

      // gestion des combinaisons
      const dices = games[gameIndex].gameState.deck.dices;
      const isDefi = Math.random() < 0.15;
      const isSec = false;

      // gestion des choix
      const combinations = GameService.choices.findCombinations(dices, isDefi, isSec);
      games[gameIndex].gameState.choices.availableChoices = combinations;

      // check de la grille si des cases sont disponibles
      const isAnyCombinationAvailableOnGridForPlayer = GameService.grid.isAnyCombinationAvailableOnGridForPlayer(games[gameIndex].gameState);
      // Si aucune combinaison n'est disponible après le dernier lancer OU si des combinaisons sont disponibles avec les dés mais aucune sur la grille
      if (combinations.length === 0) {
        games[gameIndex].gameState.timer = 5;

        games[gameIndex].player1Socket.emit('game.timer', GameService.send.forPlayer.gameTimer('player:1', games[gameIndex].gameState));
        games[gameIndex].player2Socket.emit('game.timer', GameService.send.forPlayer.gameTimer('player:2', games[gameIndex].gameState));
      }

      updateClientsViewDecks(games[gameIndex]);
      updateClientsViewChoices(games[gameIndex]);
    }
  });

  socket.on('game.dices.lock', (idDice) => {

    const gameIndex = GameService.utils.findGameIndexBySocketId(games, socket.id);
    const indexDice = GameService.utils.findDiceIndexByDiceId(games[gameIndex].gameState.deck.dices, idDice);

    // reverse flag 'locked'
    games[gameIndex].gameState.deck.dices[indexDice].locked = !games[gameIndex].gameState.deck.dices[indexDice].locked;

    updateClientsViewDecks(games[gameIndex]);
  });
  
  socket.on('game.choices.selected', (data) => {
    // gestion des choix
    const gameIndex = GameService.utils.findGameIndexBySocketId(games, socket.id);
    const game = games[gameIndex];
    game.gameState.choices.idSelectedChoice = data.choiceId;
  
    // gestion de la grille
    game.gameState.grid = GameService.grid.resetcanBeCheckedCells(game.gameState.grid);
    game.gameState.grid = GameService.grid.updateGridAfterSelectingChoice(data.choiceId, game.gameState.grid);

    updateClientsViewScores(game); // Pour mettre à jour les scores côté client
    updateClientsViewChoices(game);
    updateClientsViewGrid(game);
  });
  socket.on('game.grid.selected', (data) => {
    const gameIndex = GameService.utils.findGameIndexBySocketId(games, socket.id);
    const game      = games[gameIndex];
  
    // 1) On identifie “qui je suis”
    const me = socket.id === game.player1Socket.id ? 'player:1' : 'player:2';
  
    // 2) On n’accepte un clic que si c’est vraiment mon tour
    if (me !== game.gameState.currentTurn) return;
  
    // 3) Pose du pion
    game.gameState.grid = GameService.grid.resetcanBeCheckedCells(game.gameState.grid);
    game.gameState.grid = GameService.grid.selectCell(
      data.cellId,
      data.rowIndex,
      data.cellIndex,
      me,
      game.gameState.grid
    );
  
    // 4) Décrémente le bon compteur de jetons
    if (me === 'player:1') {
      game.gameState.player1Tokens--;
    } else {
      game.gameState.player2Tokens--;
    }
  
    // 5) Mise à jour instantanée des jetons côté client
    game.player1Socket.emit('game.tokens', {
      playerTokens:   game.gameState.player1Tokens,
      opponentTokens: game.gameState.player2Tokens
    });
    game.player2Socket.emit('game.tokens', {
      playerTokens:   game.gameState.player2Tokens,
      opponentTokens: game.gameState.player1Tokens
    });
  
    // 6) Victoire par épuisement des jetons
    if (game.gameState.player1Tokens <= 0 || game.gameState.player2Tokens <= 0) {
      const winner = game.gameState.player1Tokens <= 0 ? 'player:2' : 'player:1';
  
      game.player1Socket.emit('game.end', {
        winner,
        isWinner: winner === 'player:1',
        playerScore:   game.gameState.player1Score,
        opponentScore: game.gameState.player2Score,
        playerTokens:  game.gameState.player1Tokens,
        opponentTokens:game.gameState.player2Tokens
      });
      game.player2Socket.emit('game.end', {
        winner,
        isWinner: winner === 'player:2',
        playerScore:   game.gameState.player2Score,
        opponentScore: game.gameState.player1Score,
        playerTokens:  game.gameState.player2Tokens,
        opponentTokens:game.gameState.player1Tokens
      });
      return;
    }
  
    // 7) Vérification alignements / victoire instantanée
    const result = GameService.grid.checkAlignmentsAndScore(game.gameState.grid, me, game.gameState);
    if (result.won) {
      // notification de fin de partie
      game.player1Socket.emit('game.end', {
        winner: me,
        isWinner: me === 'player:1',
        playerScore:   game.gameState.player1Score,
        opponentScore: game.gameState.player2Score,
        playerTokens:  game.gameState.player1Tokens,
        opponentTokens:game.gameState.player2Tokens
      });
      game.player2Socket.emit('game.end', {
        winner: me,
        isWinner: me === 'player:2',
        playerScore:   game.gameState.player2Score,
        opponentScore: game.gameState.player1Score,
        playerTokens:  game.gameState.player2Tokens,
        opponentTokens:game.gameState.player1Tokens
      });
      return;
    }
    if (result.points > 0) {
      GameService.addPointToPlayer(game.gameState, me, result.points);
      updateClientsViewScores(game);
    }
  
    // 8) Bascule et reset pour le tour suivant
    game.gameState.currentTurn = me === 'player:1' ? 'player:2' : 'player:1';
    game.gameState.timer      = GameService.timer.getTurnDuration();
    game.gameState.deck       = GameService.init.deck();
    game.gameState.choices    = GameService.init.choices();
    game.gameState.grid       = GameService.grid.resetcanBeCheckedCells(game.gameState.grid);
  
    updateClientsViewTimers(game);
    updateClientsViewDecks(game);
    updateClientsViewChoices(game);
    updateClientsViewGrid(game);
  
    // 9) Si c’est au bot, on déclenche immédiatement son tour
    if (game.gameState.currentTurn === 'player:2' && game.player2Socket.id === 'bot') {
      handleBotTurn(game);
    }
  });
  
  
  socket.on('disconnect', reason => {
    console.log(`[${socket.id}] socket disconnected - ${reason}`);
  });
});

function handleBotTurn(game) {
  if (game.botPlaying || game.gameState.currentTurn !== 'player:2') return;
  game.botPlaying = true;

  const delay = 1000 + Math.random() * 2000;
  setTimeout(() => {
    // 1) reset compteur de lancers
    game.gameState.deck.rollsCounter = 0;

    // 2) Lancers + première combinaison non-vide
    for (let roll = 1; roll <= 2; roll++) {
      game.gameState.deck.dices = GameService.dices.roll(game.gameState.deck.dices);
      game.gameState.deck.rollsCounter++;
      const isSec = game.gameState.deck.rollsCounter === 2;
      const combos = GameService.choices.findCombinations(
        game.gameState.deck.dices, false, isSec
      );
      game.gameState.choices.availableChoices = combos;
      updateClientsViewChoices(game);
      updateClientsViewGrid(game);
      if (combos.length) break;
    }

    // 3) Si pas de combo → passage de tour
    if (game.gameState.choices.availableChoices.length === 0) {
      game.player1Socket.emit('bot.cant.play');
      return finishBotTurn(game);
    }

    // 4) Pose du pion choisi
    const choice = game.gameState.choices.availableChoices[0];
    game.gameState.choices.idSelectedChoice = choice.id;
    game.gameState.grid = GameService.grid.resetcanBeCheckedCells(game.gameState.grid);
    game.gameState.grid = GameService.grid.updateGridAfterSelectingChoice(choice.id, game.gameState.grid);

    // 5) Placement + décrément jeton
    let placed = false;
    outer:
    for (let i = 0; i < game.gameState.grid.length; i++) {
      for (let j = 0; j < game.gameState.grid[i].length; j++) {
        const cell = game.gameState.grid[i][j];
        if (cell.canBeChecked && !cell.owner) {
          game.gameState.grid = GameService.grid.selectCell(
            cell.id, i, j, 'player:2', game.gameState.grid
          );
          game.gameState.player2Tokens--;
          placed = true;
          break outer;
        }
      }
    }

    // **Mise à jour des jetons**
    game.player1Socket.emit('game.tokens', {
      playerTokens:   game.gameState.player1Tokens,
      opponentTokens: game.gameState.player2Tokens
    });
    game.player2Socket.emit('game.tokens', {
      playerTokens:   game.gameState.player2Tokens,
      opponentTokens: game.gameState.player1Tokens
    });

    // **Victoire par épuisement**
    if (game.gameState.player2Tokens <= 0 || game.gameState.player1Tokens <= 0) {
      const winner = game.gameState.player2Tokens <= 0 ? 'player:1' : 'player:2';
      game.player1Socket.emit('game.end', {
        winner,
        isWinner: winner === 'player:1',
        playerScore:   game.gameState.player1Score,
        opponentScore: game.gameState.player2Score,
        playerTokens:  game.gameState.player1Tokens,
        opponentTokens:game.gameState.player2Tokens
      });
      game.player2Socket.emit('game.end', {
        winner,
        isWinner: winner === 'player:2',
        playerScore:   game.gameState.player2Score,
        opponentScore: game.gameState.player1Score,
        playerTokens:  game.gameState.player2Tokens,
        opponentTokens:game.gameState.player1Tokens
      });
      game.botPlaying = false;
      return;
    }

    // 6) Alignements / points
    if (placed) {
      const res = GameService.grid.checkAlignmentsAndScore(game.gameState.grid, 'player:2', game.gameState);
      if (res.won) {
        game.player1Socket.emit('game.end', {
          winner: 'player:2', isWinner: false,
          playerScore: game.gameState.player1Score,
          opponentScore: game.gameState.player2Score
        });
        game.player2Socket.emit('game.end', {
          winner: 'player:2', isWinner: true,
          playerScore: game.gameState.player2Score,
          opponentScore: game.gameState.player1Score
        });
        return;
      }
      if (res.points > 0) {
        GameService.addPointToPlayer(game.gameState, 'player:2', res.points);
        updateClientsViewScores(game);
      }
    }

    // 7) Fin du tour du bot
    finishBotTurn(game);

  }, delay);
}

function finishBotTurn(game) {
  // prépare le tour humain
  finishHumanTurn(game);
  game.botPlaying = false;
}


function finishBotTurn(game) {
  // prépare le tour humain
  finishHumanTurn(game);
  game.botPlaying = false;
}


// -----------------------------------
// -------- SERVER METHODS -----------
// -----------------------------------

app.get('/', (req, res) => res.sendFile('index.html'));

http.listen(3000, function () {
  console.log('listening on *:3000');
});
