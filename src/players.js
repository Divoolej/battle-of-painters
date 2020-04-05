import {
  BOARD,
  COLORS,
  ANGULAR_VELOCITY_MAGNITUDE,
  PLAYER,
  INPUT,
} from '~/src/constants';
import { drawBoardPixel } from '~/src/board';
import { onInput } from '~/src/networking';

export const initPlayers = (playerList) => {
  const img = new Image();
  img.src = PLAYER.IMAGE;
  playerList.forEach(player => {
    let controls = undefined;
    if (player.id === playerId) {
      controls = {
        left: {
          code: "KeyA",
          isPressed: false,
        },
        right: {
          code: "KeyD",
          isPressed: false
        },
      };
    }
    players.push({
      ...player,
      color: COLORS[player.tile],
      image: img,
      controls,
    })
  });
}

export const handleInput = (event) => {
  const player = players.find(p => p.id === playerId);
  if (!player) return;
  if (event.type === "keydown") {
    if (!player.controls.left.isPressed && event.code === player.controls.left.code) {
      onInput(INPUT.LEFT, true);
      player.controls.left.isPressed = true;
      if (player.controls.right.isPressed) {
        player.angularVelocity = 0;
      } else {
        player.angularVelocity = -ANGULAR_VELOCITY_MAGNITUDE;
      }
    } else if (!player.controls.right.isPressed && event.code === player.controls.right.code) {
      onInput(INPUT.RIGHT, true);
      player.controls.right.isPressed = true;
      if (player.controls.left.isPressed) {
        player.angularVelocity = 0;
      } else {
        player.angularVelocity = ANGULAR_VELOCITY_MAGNITUDE;
      }
    }
  } else if (event.type === "keyup") {
    if (event.code === player.controls.left.code) {
      onInput(INPUT.LEFT, false);
      player.controls.left.isPressed = false;
      if (player.controls.right.isPressed) {
        player.angularVelocity = ANGULAR_VELOCITY_MAGNITUDE;
      } else {
        player.angularVelocity = 0;
      }
    } else if (event.code === player.controls.right.code) {
      onInput(INPUT.RIGHT, false);
      player.controls.right.isPressed = false;
      if (player.controls.left.isPressed) {
        player.angularVelocity = -ANGULAR_VELOCITY_MAGNITUDE;
      } else {
        player.angularVelocity = 0;
      }
    }
  } else if (event.type === "touchstart" || event.type === "touchmove") {
    if (event.touches[0].clientX < window.innerWidth / 2) {
      if (player.controls.right.isPressed) {
        onInput(INPUT.RIGHT, false);
        player.controls.right.isPressed = false;
      }
      onInput(INPUT.LEFT, true);
      player.controls.left.isPressed = true;
      player.angularVelocity = -ANGULAR_VELOCITY_MAGNITUDE;
    } else {
      if (player.controls.left.isPressed) {
        onInput(INPUT.LEFT, false);
        player.controls.left.isPressed = false;
      }
      onInput(INPUT.RIGHT, true);
      player.controls.right.isPressed = true;
      player.angularVelocity = ANGULAR_VELOCITY_MAGNITUDE;
    }
  } else if (event.type === "touchend" || event.type === "touchcancel") {
    if (player.controls.left.isPressed) {
      player.controls.left.isPressed = false;
      onInput(INPUT.LEFT, false);
    } else {
      player.controls.right.isPressed = false;
      onInput(INPUT.RIGHT, false);
    }
    player.angularVelocity = 0;
  }
}

export const drawPlayers = () => {
  players.forEach(player => {
    const x = (player.x + 0.5) | 0;
    const y = (player.y + 0.5) | 0;

    bgGfx.beginPath();
    bgGfx.fillStyle = player.color.hex;
    bgGfx.arc(x, y, player.radius, 0, 2 * Math.PI);
    bgGfx.fill();

    fgGfx.drawImage(
      player.image,
      x - PLAYER.WIDTH / 2,
      y - PLAYER.HEIGHT / 2 - PLAYER.IMAGE_OFFSET, // Center the brush on the splash
      PLAYER.WIDTH,
      PLAYER.HEIGHT,
    );
  });
}
