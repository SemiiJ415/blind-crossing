
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
}

function resetRound() {
  // reset player positions
  gameState.players.p1 = { x: 0, y: 3 };
  gameState.players.p2 = { x: 7, y: 3 };

  // reset turn
  gameState.currentPlayer = "p1";

  // clear round state
  gameState.gameOver = false;
  gameState.winner = null;

  clearMessage();
  generateBombs();
  renderBoard();
  updateTurnIndicator();
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
    switchTurn();
    renderBoard();

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
  const key = `${player.x},${player.y}`;

  if (!gameState.bombs.has(key)) return;

  // trigger bomb
  console.log("💥 Bomb triggered at", key);
  setMessage(`💥 Bomb! ${gameState.currentPlayer} triggered a bomb`)

  applyBombPenalty(player);
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

function setMessage(text, persistent = false) {
    messageEl.textContent = text;
    gameState.clearMessageNextTurn = persistent;
}

function clearMessage() {
    messageEl.textContent = "";
    // clearMessageNextTurn = false;
}

function updateScoreboard() {
    p1ScoreEl.textContent = gameState.matchScore.p1;
    p2ScoreEl.textContent = gameState.matchScore.p2;

}

function updateTurnIndicator() {
    const playerName = gameState.currentPlayer === "p1" ? "Player 1" : "Player 2";

    turnEl.textContent = `${playerName}'s turn`
}

generateBombs();
renderBoard();
updateTurnIndicator();