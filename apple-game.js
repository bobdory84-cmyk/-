(function () {
  const stage = document.getElementById('stage');
  const basket = document.getElementById('basket');
  const scoreEl = document.getElementById('score');
  const bestEl = document.getElementById('best');
  const finalScoreEl = document.getElementById('finalScore');
  const startOverlay = document.getElementById('startOverlay');
  const gameOverOverlay = document.getElementById('gameOverOverlay');
  const startBtn = document.getElementById('startBtn');
  const restartBtn = document.getElementById('restartBtn');

  const BASKET_WIDTH = 70;
  const BASKET_HEIGHT = 40;
  const APPLE_SIZE = 34;

  let stageRect = stage.getBoundingClientRect();
  let basketX = stageRect.width / 2;

  let apples = [];
  let score = 0;
  let best = Number(localStorage.getItem('appleGameBest') || 0);
  bestEl.textContent = best;

  let running = false;
  let startTime = 0;
  let lastSpawn = 0;
  let spawnInterval = 1400;
  let rafId = null;

  function updateStageRect() {
    stageRect = stage.getBoundingClientRect();
  }
  window.addEventListener('resize', updateStageRect);

  function moveBasketTo(clientX) {
    updateStageRect();
    let x = clientX - stageRect.left;
    x = Math.max(BASKET_WIDTH / 2, Math.min(stageRect.width - BASKET_WIDTH / 2, x));
    basketX = x;
    basket.style.left = basketX + 'px';
  }

  stage.addEventListener('mousemove', (e) => {
    moveBasketTo(e.clientX);
  });

  stage.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches[0]) {
      moveBasketTo(e.touches[0].clientX);
      e.preventDefault();
    }
  }, { passive: false });

  function spawnApple() {
    const el = document.createElement('div');
    el.className = 'apple';
    el.textContent = '🍎';
    const x = Math.random() * (stageRect.width - APPLE_SIZE);
    el.style.left = x + 'px';

    const elapsed = (Date.now() - startTime) / 1000;
    const speedBonus = Math.min(elapsed / 6, 6);
    const speed = 1.8 + Math.random() * 1.2 + speedBonus;

    stage.appendChild(el);
    apples.push({ el, x, y: -60, speed });
  }

  function getSpawnCount() {
    const elapsed = (Date.now() - startTime) / 1000;
    if (elapsed < 15) return 1;
    if (elapsed < 30) return Math.random() < 0.3 ? 2 : 1;
    if (elapsed < 60) return Math.random() < 0.5 ? 2 : 1;
    return Math.random() < 0.4 ? 3 : Math.random() < 0.7 ? 2 : 1;
  }

  function getSpawnInterval() {
    const elapsed = (Date.now() - startTime) / 1000;
    const interval = 1400 - elapsed * 18;
    return Math.max(interval, 380);
  }

  function endGame() {
    running = false;
    cancelAnimationFrame(rafId);
    apples.forEach((a) => a.el.remove());
    apples = [];

    if (score > best) {
      best = score;
      localStorage.setItem('appleGameBest', String(best));
      bestEl.textContent = best;
    }
    finalScoreEl.textContent = score;
    gameOverOverlay.classList.remove('hidden');
    stage.style.cursor = 'default';
  }

  function loop(timestamp) {
    if (!running) return;

    if (timestamp - lastSpawn > spawnInterval) {
      const count = getSpawnCount();
      for (let i = 0; i < count; i++) spawnApple();
      lastSpawn = timestamp;
      spawnInterval = getSpawnInterval();
    }

    const stageHeight = stageRect.height;
    const basketTop = stageHeight - 16 - BASKET_HEIGHT;

    for (let i = apples.length - 1; i >= 0; i--) {
      const apple = apples[i];
      apple.y += apple.speed;
      apple.el.style.top = apple.y + 'px';

      const appleCenterX = apple.x + APPLE_SIZE / 2;
      const appleBottom = apple.y + APPLE_SIZE;

      if (appleBottom >= basketTop && appleBottom <= basketTop + BASKET_HEIGHT) {
        const withinBasket = Math.abs(appleCenterX - basketX) < BASKET_WIDTH / 2;
        if (withinBasket) {
          apple.el.remove();
          apples.splice(i, 1);
          score++;
          scoreEl.textContent = score;
          continue;
        }
      }

      if (apple.y > stageHeight) {
        endGame();
        return;
      }
    }

    rafId = requestAnimationFrame(loop);
  }

  function startGame() {
    updateStageRect();
    score = 0;
    scoreEl.textContent = 0;
    apples.forEach((a) => a.el.remove());
    apples = [];
    startTime = Date.now();
    lastSpawn = 0;
    spawnInterval = 1400;
    running = true;
    startOverlay.classList.add('hidden');
    gameOverOverlay.classList.add('hidden');
    stage.style.cursor = 'none';
    rafId = requestAnimationFrame(loop);
  }

  startBtn.addEventListener('click', startGame);
  restartBtn.addEventListener('click', startGame);
})();
