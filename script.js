const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreElem = document.getElementById("score");
const highscoreElem = document.getElementById("highscore");
const controlsElem = document.getElementById("controls");

let gridSize = 20;
let tileCount;

function updateSizes() {
  // Plátno jako čtverec podle šířky okna (max 600px)
  const w = Math.min(window.innerWidth * 0.98, 600);
  canvas.width = w;
  canvas.height = w;
  // Zajistí, že grid je celočíselný (had nikdy nevyjede ven)
  tileCount = Math.floor(canvas.width / gridSize);
  canvas.width = canvas.height = tileCount * gridSize;
}
updateSizes();
window.addEventListener("resize", () => {
  updateSizes();
  drawGame();
});

let snake, food, dx, dy, gameOver, score;
let gameSpeed, intervalId;
let highscore = Number(localStorage.getItem("snakeHighscore")) || 0;

function updateHighscore() {
  highscoreElem.textContent = "Rekord: " + highscore;
}
function updateScore() {
  scoreElem.textContent = "Skóre: " + score;
}
function resetInterval() {
  if (intervalId) clearInterval(intervalId);
  intervalId = setInterval(gameLoop, gameSpeed);
}
function initGame() {
  updateSizes(); // Zajistí správné rozměry vždy při startu!
  snake = [{ x: Math.floor(tileCount / 2), y: Math.floor(tileCount / 2) }];
  food = randomFood();
  dx = 0;
  dy = 0;
  gameOver = false;
  score = 0;
  gameSpeed = 200;
  updateScore();
  updateHighscore();
  resetInterval();
  drawGame();
}

function randomFood() {
  let pos;
  do {
    pos = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount)
    };
  } while (snake && snake.some(segment => segment.x === pos.x && segment.y === pos.y));
  return pos;
}

// OVLÁDÁNÍ KLÁVESY
document.addEventListener("keydown", (e) => {
  if (gameOver) { initGame(); return; }
  if (dx === 0 && dy === 0) {
    if (e.key === "ArrowUp")   { dx = 0; dy = -1; }
    if (e.key === "ArrowDown") { dx = 0; dy = 1; }
    if (e.key === "ArrowLeft") { dx = -1; dy = 0; }
    if (e.key === "ArrowRight"){ dx = 1; dy = 0; }
    return;
  }
  if (e.key === "ArrowUp" && dy === 0)    { dx = 0; dy = -1; }
  if (e.key === "ArrowDown" && dy === 0)  { dx = 0; dy = 1; }
  if (e.key === "ArrowLeft" && dx === 0)  { dx = -1; dy = 0; }
  if (e.key === "ArrowRight" && dx === 0) { dx = 1; dy = 0; }
});

// OVLÁDÁNÍ NA SPODKU OBRAZOVKY
controlsElem.innerHTML = `
  <div class="row-up">
    <button id="upBtn" class="big-btn">⬆️</button>
  </div>
  <div class="row-down">
    <button id="leftBtn" class="big-btn">⬅️</button>
    <button id="downBtn" class="big-btn">⬇️</button>
    <button id="rightBtn" class="big-btn">➡️</button>
  </div>
`;
document.getElementById("upBtn").onclick = () => { if (gameOver) { initGame(); return; } if (dy === 0) { dx = 0; dy = -1; } };
document.getElementById("downBtn").onclick = () => { if (gameOver) { initGame(); return; } if (dy === 0) { dx = 0; dy = 1; } };
document.getElementById("leftBtn").onclick = () => { if (gameOver) { initGame(); return; } if (dx === 0) { dx = -1; dy = 0; } };
document.getElementById("rightBtn").onclick = () => { if (gameOver) { initGame(); return; } if (dx === 0) { dx = 1; dy = 0; } };

function gameLoop() {
  if (gameOver || (dx === 0 && dy === 0)) {
    drawGame();
    return;
  }

  const head = { x: snake[0].x + dx, y: snake[0].y + dy };

  if (
    head.x < 0 || head.y < 0 ||
    head.x >= tileCount || head.y >= tileCount ||
    snake.some(segment => segment.x === head.x && segment.y === head.y)
  ) {
    gameOver = true;
    if (score > highscore) {
      highscore = score;
      localStorage.setItem("snakeHighscore", highscore);
      updateHighscore();
    }
    drawGame();
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score++;
    updateScore();
    food = randomFood();
    if (gameSpeed > 60) {
      gameSpeed -= 10;
      resetInterval();
    }
  } else {
    snake.pop();
  }

  drawGame();
}

function drawGame() {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "lime";
  snake.forEach(segment => {
    ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
  });

  ctx.fillStyle = "red";
  ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);

  if (gameOver) {
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Konec hry!", canvas.width / 2, canvas.height / 2 - 10);
    ctx.font = "18px Arial";
    ctx.fillText("Zmáčkni šipku pro restart", canvas.width / 2, canvas.height / 2 + 20);
  }
}

initGame();