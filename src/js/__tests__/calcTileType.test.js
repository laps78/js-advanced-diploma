import { calcTileType } from '../utils';

test.each([
  [0, 64, 'top-left'],
  [1, 64, 'top'],
  [6, 64, 'top'],
  [7, 64, 'top-right'],
  [56, 64, 'bottom-left'],
  [63, 64, 'bottom-right'],
  [57, 64, 'bottom'],
  [60, 64, 'bottom'],
  [8, 64, 'left'],
  [16, 64, 'left'],
  [24, 64, 'left'],
  [32, 64, 'left'],
  [40, 64, 'left'],
  [48, 64, 'left'],
  [15, 64, 'right'],
  [23, 64, 'right'],
  [31, 64, 'right'],
  [39, 64, 'right'],
  [47, 64, 'right'],
  [55, 64, 'right'],
  [65, 64, 'out of boardsize'],
  [-13, 64, 'out of boardsize'],
  [25, 64, 'center'],
])('проверяем правильность отрисовки границ игрового поля', (index, boardsize, expected) => {
  expect(calcTileType(index, boardsize)).toBe(expected);
});
