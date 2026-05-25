const board = document.getElementById("board");

const size = 8;

// Game state
let currentPlayer = "p1";

let player1 = { x: 0, y: 3 };
let player2 = { x: 7, y: 3 };

const directions = {
  p1: 1,
  p2: -1
};


function createBoard() {
  board.innerHTML = "";

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");

      cell.dataset.x = x;
      cell.dataset.y = y;

      // Click handler for movement
      cell.addEventListener("click", handleMove);

      // Player 1
      if (x === player1.x && y === player1.y) {
        cell.classList.add("p1");
        cell.textContent = "P1";
      }

      // Player 2
      if (x === player2.x && y === player2.y) {
        cell.classList.add("p2");
        cell.textContent = "P2";
      }

      board.appendChild(cell);
    }
  }
}

function handleMove(e) {
  const x = parseInt(e.target.dataset.x);
  const y = parseInt(e.target.dataset.y);

  let player = currentPlayer === "p1" ? player1 : player2;

  if (isValidMove(player, x, y)) {
    player.x = x;
    player.y = y;

    switchTurn();
    createBoard();
  }
}

// Movement rules: 1 tile in any direction (no backward diagonals restriction.)
function isValidMove(player, x, y) {
  const dx = x - player.x;
  const dy = y - player.y;

  const forwardDir = currentPlayer === "p1" ? 1 : -1;

  // must move at most 1 tile in any direction
  const isOneStep = Math.abs(dx) <= 1 && Math.abs(dy) <= 1;

  // prevent standing still
  const notSameTile = !(dx === 0 && dy === 0);

  // enforce forward movement OR lateral movement
  const isForwardOrSide =
    (currentPlayer === "p1" && dx >= 0) ||
    (currentPlayer === "p2" && dx <= 0);

  return isOneStep && notSameTile && isForwardOrSide;
}

function switchTurn() {
  currentPlayer = currentPlayer === "p1" ? "p2" : "p1";
}

createBoard();