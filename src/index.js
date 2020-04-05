import { initGlobals } from '~/src/globals';
import { initBoard, paintBoard, drawBoardPixel } from '~/src/board';
import { initPlayers, handleInput, drawPlayers } from '~/src/players';
import { drawUI } from '~/src/ui';
import { initLobby, hideLobby } from '~/src/lobby';
import { distance } from '~/src/utils';
import { registerEvents } from '~/src/protocol';
import { initConnection } from '~/src/networking';
import { BOARD, COLORS, PLAYER, VELOCITY, RADIUS, DIRECTION_PRECISION } from '~/src/constants'

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

const updateAndDraw = () => {
  const now = performance.now()
  const dt = (now - lastUpdateTime) / 1000;
  lastUpdateTime = now;
  while (frames.length > 0 && frames[0] <= now - 1000) {
    frames.shift();
  }
  frames.push(now);

  update(dt);
  draw();

  window.requestAnimationFrame(updateAndDraw);
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
  initBoard();
  initPlayers(data.players);
  registerEventListeners();
  window.lastUpdateTime = performance.now();
  updateAndDraw();
};

export const tick = (data) => {
  for (let i = 0; i < data.players.length; i++) {
    const player = data.players[i];
    window.players[i] = {
      ...window.players[i],
      x: player.x / 10,
      y: player.y / 10,
      velocity: {
        type: player.speed,
        x: Math.cos(player.direction / DIRECTION_PRECISION) * VELOCITY.LINEAR[player.speed],
        y: Math.sin(player.direction / DIRECTION_PRECISION) * VELOCITY.LINEAR[player.speed],
      },
      radius: RADIUS[player.radius],
      angularVelocity: VELOCITY.ANGULAR[player.turning],
    };
  };
  for (let location in data.diff) {
    window.board[location] = data.diff[location];
  }
}

const update = (dt) => {
  players.forEach(player => {
    const { x, y, velocity, angularVelocity, radius, tile } = player;

    if (angularVelocity) {
      // Rotate the velocity vector
      const vX = velocity.x * Math.cos(angularVelocity * dt) - velocity.y * Math.sin(angularVelocity * dt);
      const vY = velocity.x * Math.sin(angularVelocity * dt) + velocity.y * Math.cos(angularVelocity * dt);
      player.velocity.x = vX;
      player.velocity.y = vY;
    }

    player.x += player.velocity.x * dt;
    player.y += player.velocity.y * dt;
  });

  players.forEach(player => {
    for (let i = player.index + 1; i < players.length; i++) {
      const otherPlayer = players[i];
      let dist = distance(player.x, player.y, otherPlayer.x, otherPlayer.y);
      if (dist < PLAYER.WIDTH) {
        const p1 = { x: player.x, y: player.y };
        const p2 = { x: otherPlayer.x, y: otherPlayer.y };
        const v1 = { x: player.velocity.x, y: player.velocity.y };
        const v2 = { x: otherPlayer.velocity.x, y: otherPlayer.velocity.y };
        // Normal and tangent vectors
        const normal = { x: (p2.x - p1.x) / PLAYER.WIDTH, y: (p2.y - p1.y) / PLAYER.WIDTH };
        const tangent = { x: -normal.y, y: normal.x };
        // Dot products
        const dpTan1 = v1.x * tangent.x + v1.y * tangent.y;
        const dpTan2 = v2.x * tangent.x + v2.y * tangent.y;
        const dpNorm1 = v1.x * normal.x + v1.y * normal.y;
        const dpNorm2 = v2.x * normal.x + v2.y * normal.y;
        // Final velocities
        player.velocity.x = tangent.x * dpTan1 + normal.x * dpNorm2;
        player.velocity.y = tangent.y * dpTan1 + normal.y * dpNorm2;
        const angle1 = Math.atan2(player.velocity.y, player.velocity.x);
        player.velocity.x = Math.cos(angle1) * VELOCITY.LINEAR[player.velocity.type];
        player.velocity.y = Math.sin(angle1) * VELOCITY.LINEAR[player.velocity.type];

        otherPlayer.velocity.x = tangent.x * dpTan2 + normal.x * dpNorm1;
        otherPlayer.velocity.y = tangent.y * dpTan2 + normal.y * dpNorm1;
        const angle2 = Math.atan2(otherPlayer.velocity.y, otherPlayer.velocity.x);
        otherPlayer.velocity.x = Math.cos(angle2) * VELOCITY.LINEAR[otherPlayer.velocity.type];
        otherPlayer.velocity.y = Math.sin(angle2) * VELOCITY.LINEAR[otherPlayer.velocity.type];

        const displacement = {
          x: ((p1.x - p2.x) / dist) * (PLAYER.WIDTH - dist + 1),
          y: ((p1.y - p2.y) / dist) * (PLAYER.WIDTH - dist + 1),
        };

        player.x += displacement.x;
        player.y += displacement.y;
        otherPlayer.x -= displacement.x;
        otherPlayer.y -= displacement.y;
      }
    }

    if (player.x - PLAYER.WIDTH / 2 < 0) {
      player.x = PLAYER.WIDTH / 2;
      player.ai && (player.velocity.x = -player.velocity.x);
    }
    if (player.x + PLAYER.WIDTH / 2 > BOARD.SIZE) {
      player.x = BOARD.SIZE - PLAYER.WIDTH / 2;
      player.ai && (player.velocity.x = -player.velocity.x);
    }
    if (player.y - PLAYER.HEIGHT / 2 < 0) {
      player.y = PLAYER.HEIGHT / 2;
      player.ai && (player.velocity.y = -player.velocity.y);
    }
    if (player.y + PLAYER.HEIGHT / 2 > BOARD.SIZE) {
      player.y = BOARD.SIZE - PLAYER.HEIGHT / 2;
      player.ai && (player.velocity.y = -player.velocity.y);
    }

    paintBoard((player.x + 0.5) | 0, (player.y + 0.5) | 0, player.radius, player.tile);
  })
}

const draw = () => {
  fgGfx.clearRect(0, 0, foreground.width, foreground.height);
  drawPlayers();
  drawUI();
  lastFrameBackup = bgGfx.getImageData(0, 0, background.width, background.height);
}

if (['complete', 'interactive'].includes(document.readyState)) {
  setTimeout(init, 0);
} else {
  document.addEventListener('DOMContentLoaded', init);
}
