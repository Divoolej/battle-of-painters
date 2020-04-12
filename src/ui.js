import { BOARD } from '~/src/constants';

export const drawUI = () => {
  fgGfx.font = "16px Arial";
  fgGfx.fillStyle = "black";
  fgGfx.fillText("FPS: " + frames.length, 548, 24);
  fgGfx.fillText("Ping: " + Math.round(pings.reduce((s, v) => s + v, 0) / pings.length), 548, 44);
};
