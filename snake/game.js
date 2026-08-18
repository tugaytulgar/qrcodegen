(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score');
  const highScoreEl = document.getElementById('highScore');
  const statusEl = document.getElementById('status');
  const overlay = document.getElementById('overlay');
  const startBtn = document.getElementById('startBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const centerBtn = document.getElementById('centerBtn');

  const COLS = 24;
  const ROWS = 18;
  const CELL = canvas.width / COLS;
  const START_SPEED = 145;
  const MIN_SPEED = 68;
  const SPEED_STEP = 5;

  let snake = [];
  let food = { x: 18, y: 9 };
  let dir = { x: 1, y: 0 };
  let nextDir = { x: 1, y: 0 };
  let timer = null;
  let running = false;
  let paused = false;
  let score = 0;
  let speed = START_SPEED;
  let highScore = Number(localStorage.getItem('snake5510HighScore') || 0);

  highScoreEl.textContent = highScore;

  function reset() {
    snake = [
      { x: 8, y: 9 },
      { x: 7, y: 9 },
      { x: 6, y: 9 },
      { x: 5, y: 9 }
    ];
    dir = { x: 1, y: 0 };
    nextDir = { x: 1, y: 0 };
    score = 0;
    speed = START_SPEED;
    scoreEl.textContent = score;
    placeFood();
    draw();
  }

  function start() {
    if (!running) {
      reset();
      running = true;
      paused = false;
      overlay.classList.add('hidden');
      statusEl.textContent = 'OYUN';
      schedule();
      return;
    }
    if (paused) togglePause();
  }

  function schedule() {
    clearInterval(timer);
    timer = setInterval(tick, speed);
  }

  function togglePause() {
    if (!running) return start();
    paused = !paused;
    statusEl.textContent = paused ? 'DURDU' : 'OYUN';
    overlay.innerHTML = paused
      ? '<div class="overlay-title">DURAKLATILDI</div><div class="overlay-sub">Devam etmek için ● veya Space</div>'
      : '';
    overlay.classList.toggle('hidden', !paused);
  }

  function endGame() {
    running = false;
    clearInterval(timer);
    if (score > highScore) {
      highScore = score;
      localStorage.setItem('snake5510HighScore', String(highScore));
      highScoreEl.textContent = highScore;
    }
    statusEl.textContent = 'BİTTİ';
    overlay.innerHTML = `<div class="overlay-title">OYUN BİTTİ</div><div class="overlay-sub">Skor: ${score}<br>Tekrar için ▶</div>`;
    overlay.classList.remove('hidden');
    vibrate([70, 50, 120]);
  }

  function tick() {
    if (!running || paused) return;
    dir = nextDir;
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

    const hitWall = head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS;
    const hitSelf = snake.some(p => p.x === head.x && p.y === head.y);
    if (hitWall || hitSelf) return endGame();

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
      score += 10;
      scoreEl.textContent = score;
      vibrate(25);
      placeFood();
      const newSpeed = Math.max(MIN_SPEED, START_SPEED - Math.floor(score / 50) * SPEED_STEP);
      if (newSpeed !== speed) {
        speed = newSpeed;
        schedule();
      }
    } else {
      snake.pop();
    }
    draw();
  }

  function placeFood() {
    do {
      food = {
        x: Math.floor(Math.random() * COLS),
        y: Math.floor(Math.random() * ROWS)
      };
    } while (snake.some(p => p.x === food.x && p.y === food.y));
  }

  function draw() {
    ctx.fillStyle = '#9eaa6c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(45,55,32,.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= COLS; x++) {
      ctx.beginPath(); ctx.moveTo(x * CELL, 0); ctx.lineTo(x * CELL, canvas.height); ctx.stroke();
    }
    for (let y = 0; y <= ROWS; y++) {
      ctx.beginPath(); ctx.moveTo(0, y * CELL); ctx.lineTo(canvas.width, y * CELL); ctx.stroke();
    }

    const fx = food.x * CELL + CELL / 2;
    const fy = food.y * CELL + CELL / 2;
    ctx.fillStyle = '#26301f';
    ctx.beginPath();
    ctx.moveTo(fx, fy - CELL * .38);
    ctx.lineTo(fx + CELL * .38, fy);
    ctx.lineTo(fx, fy + CELL * .38);
    ctx.lineTo(fx - CELL * .38, fy);
    ctx.closePath();
    ctx.fill();

    snake.forEach((p, i) => {
      const pad = i === 0 ? 1 : 2;
      ctx.fillStyle = '#26301f';
      ctx.fillRect(p.x * CELL + pad, p.y * CELL + pad, CELL - pad * 2, CELL - pad * 2);
      if (i === 0) drawEyes(p);
    });
  }

  function drawEyes(head) {
    ctx.fillStyle = '#9eaa6c';
    const baseX = head.x * CELL;
    const baseY = head.y * CELL;
    const s = 2;
    if (dir.x !== 0) {
      const ex = dir.x > 0 ? baseX + CELL - 4 : baseX + 2;
      ctx.fillRect(ex, baseY + 3, s, s);
      ctx.fillRect(ex, baseY + CELL - 5, s, s);
    } else {
      const ey = dir.y > 0 ? baseY + CELL - 4 : baseY + 2;
      ctx.fillRect(baseX + 3, ey, s, s);
      ctx.fillRect(baseX + CELL - 5, ey, s, s);
    }
  }

  function setDirection(name) {
    const map = {
      up: { x: 0, y: -1 },
      down: { x: 0, y: 1 },
      left: { x: -1, y: 0 },
      right: { x: 1, y: 0 }
    };
    const nd = map[name];
    if (!nd) return;
    if (nd.x === -dir.x && nd.y === -dir.y) return;
    nextDir = nd;
    if (!running) start();
  }

  function vibrate(pattern) {
    if (navigator.vibrate) navigator.vibrate(pattern);
  }

  document.querySelectorAll('[data-dir]').forEach(btn => {
    const act = e => {
      e.preventDefault();
      setDirection(btn.dataset.dir);
    };
    btn.addEventListener('pointerdown', act);
  });

  startBtn.addEventListener('click', () => {
    if (running) {
      running = false;
      clearInterval(timer);
    }
    start();
  });
  pauseBtn.addEventListener('click', togglePause);
  centerBtn.addEventListener('click', () => running ? togglePause() : start());

  window.addEventListener('keydown', e => {
    const key = e.key.toLowerCase();
    const keyMap = {
      arrowup: 'up', w: 'up',
      arrowdown: 'down', s: 'down',
      arrowleft: 'left', a: 'left',
      arrowright: 'right', d: 'right'
    };
    if (keyMap[key]) {
      e.preventDefault();
      setDirection(keyMap[key]);
    } else if (key === ' ') {
      e.preventDefault();
      togglePause();
    } else if (key === 'enter') {
      e.preventDefault();
      start();
    }
  }, { passive: false });

  let touchStart = null;
  canvas.addEventListener('pointerdown', e => {
    touchStart = { x: e.clientX, y: e.clientY };
  });
  canvas.addEventListener('pointerup', e => {
    if (!touchStart) return;
    const dx = e.clientX - touchStart.x;
    const dy = e.clientY - touchStart.y;
    touchStart = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 18) return;
    if (Math.abs(dx) > Math.abs(dy)) setDirection(dx > 0 ? 'right' : 'left');
    else setDirection(dy > 0 ? 'down' : 'up');
  });

  reset();
})();
