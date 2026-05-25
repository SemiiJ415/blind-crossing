
// 1. GAME STATE
const size = 8;

let gameState = {
  currentPlayer: "p1",
  players: {
    p1: { x: 0, y: 3 },
    p2: { x: 7, y: 3 }
  },
  bombs: new Set()
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
    console.log(`${nextPlayer} skipped turn`);
    switchTurn(); // skip again
  }
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
  const player = getCurrentPlayer();

  if (!isValidMove(player, x, y)) return;

  player.x = x;
  player.y = y;

  checkTileEffects(player);

  switchTurn();
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

    console.log("↩️ Returned to start");
  } else {
    // lose next turn (simple version = skip turn immediately after switch)
    console.log("⏭️ Lose next turn");

    // mark skip flag
    player.skipNextTurn = true;
  }
}

// 3. RENDER SYSTEM
const board = document.getElementById("board");

function renderBoard() {
  board.innerHTML = "";

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

      if (x === p1.x && y === p1.y) {
        cell.classList.add("p1");
        cell.textContent = "P1";
      }

      if (x === p2.x && y === p2.y) {
        cell.classList.add("p2");
        cell.textContent = "P2";
      }

      board.appendChild(cell);
    }
  }
}

generateBombs();
renderBoard();