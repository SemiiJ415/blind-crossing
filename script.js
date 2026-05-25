
// 1. GAME STATE
const size = 8;

let gameState = {
  currentPlayer: "p1",
  players: {
    p1: { x: 0, y: 3 },
    p2: { x: 7, y: 3 }
  },
  bombs: [] 
};


// 2. GAME ENGINE (RULES)


function getCurrentPlayer() {
  return gameState.players[gameState.currentPlayer];
}

function switchTurn() {
  gameState.currentPlayer =
    gameState.currentPlayer === "p1" ? "p2" : "p1";
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
function checkTileEffects(player) {
  if (isBomb(player.x, player.y)) triggerBomb();
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


renderBoard();