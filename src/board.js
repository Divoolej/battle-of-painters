import { BOARD } from '~/src/constants';
import { overlap } from '~/src/utils'

export const initBoard = () => {
  for (let i = 0; i < BOARD.SIZE * BOARD.SIZE; i++) {
    board.push(BOARD.EMPTY);
  }
}

export const paintBoard = (x, y, radius, tile) => {
  for (let i = x - radius; i < x + radius; i++) {
    for (let j = y - radius; j < y + radius; j++) {
      if (i < 0 || j < 0 || i >= BOARD.SIZE || j >= BOARD.SIZE) continue;
      if (overlap(x, y, i, j, radius)) {
        board[j * BOARD.SIZE + i] = tile;
      }
    }
  }
}

export const drawBoardPixel = (frame, x, y, color) => {
  for (let i = 0; i < scale; i++) {
    for (let j = 0; j < scale; j++) {
      const index = ((y + j) * BOARD.SIZE * scale + x + i) * 4; // 4 - bytes per pixel
      frame[index] = color.r;
      frame[index + 1] = color.g;
      frame[index + 2] = color.b;
    }
  }
}
