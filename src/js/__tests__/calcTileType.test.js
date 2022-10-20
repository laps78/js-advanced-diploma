import { calcTileType } from '../utils';

test.each([
  [0, 8, 'top-left'],
  [1, 8, 'top'],
  [6, 8, 'top'],
  [7, 8, 'top-right'],
  [56, 8, 'bottom-left'],
  [63, 8, 'bottom-right'],
  [57, 8, 'bottom'],
  [60, 8, 'bottom'],
  [8, 8, 'left'],
  [16, 8, 'left'],
  [24, 8, 'left'],
  [32, 8, 'left'],
  [40, 8, 'left'],
  [48, 8, 'left'],
  [15, 8, 'right'],
  [23, 8, 'right'],
  [31, 8, 'right'],
  [39, 8, 'right'],
  [47, 8, 'right'],
  [55, 8, 'right'],
  [25, 8, 'center'],
])('проверяем правильность отрисовки границ игрового поля', (index, boardsize, expected) => {
  expect(calcTileType(index, boardsize)).toBe(expected);
});
