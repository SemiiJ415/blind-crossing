
// 1. GAME STATE
const size = 8;

let clearMessageNextTurn = false;

let gameState = {
  currentPlayer: "p1",
  players: {
    p1: { x: 0, y: 3 },
    p2: { x: 7, y: 3 }
  },
  bombs: new Set(),

  detectorMode: false,

  playerStats: {
  p1: {
    detectorState: "LOCKED",
    safeMoves: 0,
  },
  p2: {
    detectorState: "LOCKED",
    safeMoves: 0,
  }
    },

  p1Goal: null,
  p2Goal: null,

  
  winner: null,
  gameOver: false,

  matchScore: {
    p1: 0,
    p2: 0
  },

  roundWinner: null,
  matchOver: false,

  message: "",
  clearMessageNextTurn: false
};

// 2. GAME ENGINE (RULES)

function getCurrentPlayer() {
  return gameState.players[gameState.currentPlayer];
}

function switchTurn() {
  const nextPlayer =
    gameState.currentPlayer === "p1" ? "p2" : "p1";

    gameState.currentPlayer = nextPlayer;

    const player = gameState.players[nextPlayer];

    // handle skip turn
    if (player.skipNextTurn) {
        player.skipNextTurn = false;
        clearMessage();
        console.log(`${nextPlayer} skipped turn`);
        switchTurn(); // skip again
        return;
  }

    updateTurnIndicator();
    updateDetectorUI();
    updateDetectorStatusUI();

}

function updateDetectorState(playerKey, isSafeMove) {
  const stats = gameState.playerStats[playerKey];

  if (stats.detectorState === "USED") {
    return;
  }
  // only count safe moves
  if (isSafeMove) {
    stats.safeMoves += 1;
  }

  if (stats.safeMoves >= 2) {
    stats.safeMoves = 2;
    stats.detectorState = "READY"
  }
}

function resetRound() {
    gameState.gameOver = false;
  
    if (gameState.roundWinner) {
      gameState.currentPlayer = gameState.roundWinner;
    }

  gameState.players.p1 = { x: 0, y: 3 };
  gameState.players.p2 = { x: 7, y: 3 };

  gameState.gameOver = false;
  gameState.winner = null;

  gameState.playerStats.p1.detectorState = "LOCKED";
  gameState.playerStats.p2.detectorState = "LOCKED";

  gameState.playerStats.p1.safeMoves = 0;
  gameState.playerStats.p2.safeMoves = 0;

    clearMessage();
    generateBombs();
    renderBoard();
    updateTurnIndicator();
    updateDetectorUI();
    updateDetectorStatusUI();

}

function resetMatch() {
  gameState.matchScore.p1 = 0;
  gameState.matchScore.p2 = 0;

  gameState.matchOver = false;
  gameState.gameOver = false;
  gameState.winner = null;

  clearMessage();

  resetRound();
}

// Movement rule
function isValidMove(player, x, y) {
  const dx = x - player.x;
  const dy = y - player.y;

  const isOneStep =
    Math.abs(dx) <= 1 && Math.abs(dy) <= 1;

  const notSameTile = !(dx === 0 && dy === 0);

  // forward constraint (direction-based)
  const forwardOnly =
    (gameState.currentPlayer === "p1" && dx >= 0) ||
    (gameState.currentPlayer === "p2" && dx <= 0);

  return isOneStep && notSameTile && forwardOnly;
}

function movePlayer(x, y) {

    if (gameState.gameOver) return;

    const player = getCurrentPlayer();

    if (!isValidMove(player, x, y)) return;

    if (gameState.clearMessageNextTurn) {
    clearMessage();
    gameState.clearMessageNextTurn = false;
  }

    player.x = x;
    player.y = y;

    checkTileEffects(player);
    checkWin(gameState.currentPlayer);
    if (gameState.gameOver){
      return;
    }

    clearActionMessage();
    switchTurn();
    renderBoard();
    updateDetectorUI();
    updateDetectorStatusUI();

}

function checkWin(playerKey) {
  if (gameState.gameOver || gameState.matchOver) return;

  const player = gameState.players[playerKey];

  const goal =
    playerKey === "p1"
      ? gameState.p1Goal
      : gameState.p2Goal;

  const hasWon =
    player.x === goal.x &&
    player.y === goal.y;

  if (!hasWon) return;

  gameState.gameOver = true;
  gameState.winner = playerKey;
  gameState.roundWinner = playerKey;
  

  // add score
  gameState.matchScore[playerKey]++;

  // match winner
  if (gameState.matchScore[playerKey] === 3) {
    gameState.matchOver = true;

    setMessage(
      `🏆 ${playerKey.toUpperCase()} wins the match! Final score: ${gameState.matchScore.p1}-${gameState.matchScore.p2}`,
      true
    );

    renderBoard();
    return;
  }

  // round winner
  setMessage(
    `🏆 ${playerKey.toUpperCase()} wins the round! Score: ${gameState.matchScore.p1}-${gameState.matchScore.p2}`,
    true
  );
  
    lockRoundUI();
    renderBoard();
}

//BOMBS
function generateBombs(count = 10) {
  gameState.bombs.clear();

  while (gameState.bombs.size < count) {
    const x = Math.floor(Math.random() * size);
    const y = Math.floor(Math.random() * size);

    // prevent starting positions
    const isStartP1 = x === 0 && y === 3;
    const isStartP2 = x === 7 && y === 3;

    if (isStartP1 || isStartP2) continue;

    gameState.bombs.add(`${x},${y}`);
  }
}
function isBomb(x, y) {
  return gameState.bombs.has(`${x},${y}`);
}

function checkTileEffects(player) {
    const playerKey = gameState.currentPlayer;
    const stats = gameState.playerStats[playerKey];
    const key = `${player.x},${player.y}`;

    if (gameState.bombs.has(key)) {
      console.log("💥 Bomb triggered at", key);
      setMessage(`💥 Bomb! ${gameState.currentPlayer} triggered a bomb`)

    stats.safeMoves = Math.max(0, stats.safeMoves - 1);
    stats.detectorState = "LOCKED";

    applyBombPenalty(player);
    return;
}

    updateDetectorState(playerKey, true)
}

function applyBombPenalty(player) {
  const roll = Math.random();

  // 50/50 rotation system
  if (roll < 0.5) {
    // return to start
    if (gameState.currentPlayer === "p1") {
      player.x = 0;
      player.y = 3;
    } else {
      player.x = 7;
      player.y = 3;
    }

    setMessage(`💥 Bomb! ${gameState.currentPlayer} returns to start`, true);
    console.log("↩️ Returned to start");
  } else {
    // lose next turn (simple version = skip turn immediately after switch)
    setMessage(`💥 Bomb! ${gameState.currentPlayer} loses next turn`, true);
    console.log("⏭️ Lose next turn");

    // mark skip flag
    player.skipNextTurn = true;
  }
}

// 3. RENDER SYSTEM
const board = document.getElementById("board");

const messageEl = document.getElementById("game-message");

const p1ScoreEl = document.getElementById("p1-score")
const p2ScoreEl = document.getElementById("p2-score")


const turnEl = document.getElementById("turn-indicator")

const p1DetectorUI = document.getElementById("p1-detector")
const p2DetectorUI = document.getElementById("p2-detector")


const detectorBtn = document.getElementById("detector-btn")

detectorBtn.addEventListener("click", () => {
  gameState.detectorMode = true;
  setMessage("🔍 Select a tile to scan.");
});

const nextRoundBtn = document.getElementById("next-round-btn")

nextRoundBtn.addEventListener("click", () => {
    if (gameState.matchOver) return;
    if (gameState.gameOver) {
        resetRound();
    }
})

const playAgainBtn = document.getElementById("play-again-btn")

playAgainBtn.addEventListener("click", () => {
  resetMatch();
});

function renderBoard() {
  board.innerHTML = "";
    gameState.p1Goal = {
    x: 7,
    y: gameState.players.p1.y
    };

    gameState.p2Goal = {
    x: 0,
    y: gameState.players.p2.y
    };

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");

      cell.dataset.x = x;
      cell.dataset.y = y;

      cell.addEventListener("click", () => {
        if (gameState.detectorMode) {
            scanTile(x, y);
            return;
        }
        movePlayer(x, y);
      });

      const p1 = gameState.players.p1;
      const p2 = gameState.players.p2;

        if (
        x === gameState.p1Goal.x &&
        y === gameState.p1Goal.y
        ) {
        cell.classList.add("finish-tile");
        }

        if (
        x === gameState.p2Goal.x &&
        y === gameState.p2Goal.y
        ) {
        cell.classList.add("finish-tile");
        }   

        if (x === p1.x && y === p1.y) {
        cell.classList.add("p1");
        cell.textContent = "P1";
        }

        if (x === p2.x && y === p2.y) {
        cell.classList.add("p2");
        cell.textContent = "P2";
        }

      board.appendChild(cell);

        if (gameState.matchOver) {
        nextRoundBtn.style.display = "none";
        playAgainBtn.style.display = "block";

        } else if (gameState.gameOver) {
        nextRoundBtn.style.display = "block";
        playAgainBtn.style.display = "none";

        } else {
        nextRoundBtn.style.display = "none";
        playAgainBtn.style.display = "none";
        }
    }
  }
  updateScoreboard();
}

function updateDetectorStatusUI() {
  const p1 = gameState.playerStats.p1;
  const p2 = gameState.playerStats.p2;

  p1DetectorUI.textContent =
    `P1 🔍 ${p1.safeMoves}/2 | ${p1.detectorState}` 

  p2DetectorUI.textContent =
    `P2 🔍 ${p2.safeMoves}/2 |  ${p2.detectorState}` 
}

function updateDetectorUI() {
    const player = gameState.currentPlayer;
    const stats = gameState.playerStats[player];

    if (stats.detectorState === "READY") {
        detectorBtn.style.display = "block";
    } else {
        detectorBtn.style.display = "none"
    }
}

function setMessage(text, persistent = false) {
    messageEl.textContent = text;
    gameState.clearMessageNextTurn = persistent;
}

function clearMessage() {
    messageEl.textContent = "";
    // clearMessageNextTurn = false;
}

function clearActionMessage() {
  gameState.message = "";
  clearMessage();
}

function scanTile(x, y) {
    const playerKey = gameState.currentPlayer;
    const tileKey = `${x},${y}`;

    const hasBomb = gameState.bombs.has(tileKey);

    setMessage(
        hasBomb ? "💣 Bomb detected!" : "✅ Safe tile"
    )

    const stats = gameState.playerStats[playerKey]

    stats.detectorState = "LOCKED";
    stats.safeMoves = 0
    gameState.detectorMode = false;

    renderBoard();
    updateDetectorUI();
    updateDetectorStatusUI();

}

function updateScoreboard() {
    p1ScoreEl.textContent = gameState.matchScore.p1;
    p2ScoreEl.textContent = gameState.matchScore.p2;

}

function updateTurnIndicator() {
    const playerName = gameState.currentPlayer === "p1" ? "Player 1" : "Player 2";

    turnEl.textContent = `${playerName}'s turn`
}

function lockRoundUI() {
    detectorBtn.style.display = "none";
    gameState.detectorMode = false;
}

generateBombs();
renderBoard();
updateTurnIndicator();