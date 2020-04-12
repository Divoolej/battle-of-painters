import { BOARD } from '~/src/constants';
import { overlap } from '~/src/utils'

export const initBoard = (boardData) => {
  for (let i = 0; i < BOARD.SIZE * BOARD.SIZE; i++) {
    board.push(boardData[i] || BOARD.EMPTY);
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
