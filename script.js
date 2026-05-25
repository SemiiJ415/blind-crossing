const board = document.getElementById("board");

const size = 8;

// Player starting positions
let player1 = { x: 0, y: 3 };
let player2 = { x: 7, y: 3 };


function createBoard() {
  board.innerHTML = "";

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");

      // Place Player 1
      if (x === player1.x && y === player1.y) {
        cell.classList.add("p1");
        cell.textContent = "P1";
      }

      // Place Player 2
      if (x === player2.x && y === player2.y) {
        cell.classList.add("p2");
        cell.textContent = "P2";
      }

      board.appendChild(cell);
    }
  }
}

createBoard();