import { pathToArray } from './utils';

test('pathToArray produces an expected array', () => {
  expect(pathToArray('some.path.0.property')).toMatchObject(['some', 'path', 0, 'property']);
});
