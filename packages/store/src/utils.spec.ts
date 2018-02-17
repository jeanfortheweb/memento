import { isUpdater } from './utils';
import { taskA } from './test/mocks';

test('isUpdater does return true on functions', () => {
  expect(isUpdater(jest.fn())).toBeTruthy();
});

test('isUpdater does return false on objects', () => {
  expect(isUpdater(taskA)).toBeFalsy();
});
