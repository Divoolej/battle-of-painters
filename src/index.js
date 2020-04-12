import { initGlobals } from '~/src/globals';
import { initBoard, paintBoard } from '~/src/board';
import { initPlayers, handleInput, drawPlayers } from '~/src/players';
import { drawUI } from '~/src/ui';
import { initLobby, hideLobby } from '~/src/lobby';
import { registerEvents } from '~/src/protocol';
import { initConnection } from '~/src/networking';
import { BOARD, COLORS, PLAYER, RADIUS } from '~/src/constants'

const updateCanvasSize = () => {
  const scaleX = Math.floor(window.innerWidth / BOARD.SIZE);
  const scaleY = Math.floor(window.innerHeight / BOARD.SIZE);
  scale = Math.max(1, Math.min(scaleX, scaleY));
  background.width = BOARD.SIZE// * scale;
  background.height = BOARD.SIZE// * scale;
  background.style.width = `${BOARD.SIZE * scale}px`;
  background.style.height = `${BOARD.SIZE * scale}px`;
  foreground.width = BOARD.SIZE// * scale;
  foreground.height = BOARD.SIZE// * scale;
  foreground.style.width = `${BOARD.SIZE * scale}px`;
  foreground.style.height = `${BOARD.SIZE * scale}px`;
  main.style.width = `${BOARD.SIZE * scale}px`;
  main.style.height = `${BOARD.SIZE * scale}px`;
  fgGfx.imageSmoothingEnabled = false;

  // Init or redraw Background
  if (lastFrameBackup === null) {
    bgGfx.fillStyle = COLORS[BOARD.EMPTY];
    bgGfx.fillRect(0, 0, background.width, background.height);
    bgGfx.fill();
  } else {
    bgGfx.putImageData(lastFrameBackup, 0, 0);
  }
};

const registerEventListeners = () => {
  window.addEventListener("resize", updateCanvasSize);
  window.addEventListener("keydown", handleInput);
  window.addEventListener("keyup", handleInput);
  window.addEventListener("touchstart", handleInput);
  window.addEventListener("touchmove", handleInput);
  window.addEventListener("touchend", handleInput);
  window.addEventListener("touchcancel", handleInput);
}

const draw = () => {
  const now = performance.now()
  while (frames.length > 0 && frames[0] <= now - 1000) {
    frames.shift();
  }
  frames.push(now);

  fgGfx.clearRect(0, 0, foreground.width, foreground.height);
  drawUI();
  players.forEach(player => {
    fgGfx.drawImage(
      player.image,
      player.x - PLAYER.WIDTH / 2,
      player.y - PLAYER.HEIGHT / 2 - PLAYER.IMAGE_OFFSET, // Center the brush on the splash
      PLAYER.WIDTH,
      PLAYER.HEIGHT,
    );
  });
  lastFrameBackup = bgGfx.getImageData(0, 0, background.width, background.height);

  window.requestAnimationFrame(draw);
};

const init = () => {
  initGlobals();
  registerEvents();
  initConnection();
  initLobby();
};

export const initGame = (data) => {
  hideLobby();
  updateCanvasSize();
  initBoard(data.board);
  initPlayers(data.players);
  registerEventListeners();
  drawBoardState();
  draw();
};

export const tick = (data) => {
  for (let i = 0; i < data.players.length; i++) {
    const player = data.players[i];
    window.players[i] = {
      ...window.players[i],
      x: player.x,
      y: player.y,
      radius: RADIUS[player.radius],
    };
  };
  for (let location in data.diff) {
    window.board[location] = data.diff[location];
  }
  drawPlayers();
}

const drawBoardState = () => {
  for (let y = 0; y < BOARD.SIZE; y++) {
    for (let x = 0; x < BOARD.SIZE; x++) {
      bgGfx.beginPath();
      bgGfx.fillStyle = COLORS[board[y * BOARD.SIZE + x]];
      bgGfx.fillRect(x, y, 1, 1);
      bgGfx.fill();
    }
  }
}

if (['complete', 'interactive'].includes(document.readyState)) {
  setTimeout(init, 0);
} else {
  document.addEventListener('DOMContentLoaded', init);
}
