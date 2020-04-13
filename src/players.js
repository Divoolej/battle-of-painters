import {
  BOARD,
  COLORS,
  PLAYER,
  INPUT,
} from '~/src/constants';
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
};

export const handleInput = (event) => {
  const player = players.find(p => p.id === playerId);
  if (!player) return;
  if (event.type === "touchstart") {
    if (event.touches[0].clientX < window.innerWidth / 2) {
      if (player.controls.right.isPressed) {
        onInput(INPUT.RIGHT, false);
        player.controls.right.isPressed = false;
      }
      onInput(INPUT.LEFT, true);
      player.controls.left.isPressed = true;
    } else {
      if (player.controls.left.isPressed) {
        onInput(INPUT.LEFT, false);
        player.controls.left.isPressed = false;
      }
      onInput(INPUT.RIGHT, true);
      player.controls.right.isPressed = true;
    }
  } else if (event.type === "touchend" || event.type === "touchcancel") {
    if (player.controls.left.isPressed) {
      player.controls.left.isPressed = false;
      onInput(INPUT.LEFT, false);
    } else {
      player.controls.right.isPressed = false;
      onInput(INPUT.RIGHT, false);
    }
  } else if (event.type === "keydown") {
    if (!player.controls.left.isPressed && event.code === player.controls.left.code) {
      onInput(INPUT.LEFT, true);
      player.controls.left.isPressed = true;
    } else if (!player.controls.right.isPressed && event.code === player.controls.right.code) {
      onInput(INPUT.RIGHT, true);
      player.controls.right.isPressed = true;
    }
  } else if (event.type === "keyup") {
    if (event.code === player.controls.left.code) {
      onInput(INPUT.LEFT, false);
      player.controls.left.isPressed = false;
    } else if (event.code === player.controls.right.code) {
      onInput(INPUT.RIGHT, false);
      player.controls.right.isPressed = false;
    }
  }
};

export const drawPlayers = () => {
  players.forEach(player => {
    bgGfx.beginPath();
    bgGfx.fillStyle = player.color;
    bgGfx.arc(player.x, player.y, player.radius, 0, 2 * Math.PI);
    bgGfx.fill();
  });
};
