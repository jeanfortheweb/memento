import { TestState, InnerTestProps, wire } from './test/helpers';
import { List } from 'immutable';
import update, { accept } from './update';

const element = { a: 1, b: 1 };

test('update creates the expected task object', () => {
  expect(update<TestState, InnerTestProps>('list', element, { b: 2 })).toMatchObject({
    kind: '@STATE_WORKER/UPDATE',
    path: 'list',
    element,
    data: {
      b: 2,
    },
  });
});

test('update produces the expected output state', async () => {
  const run = wire<TestState>(
    accept,
    new TestState({
      list: List([{ a: 0, b: 0 }, element]),
    }),
  );

  await run(
    update<TestState, InnerTestProps>('list', element, { b: 2 }),
    {
      list: [{ a: 0, b: 0 }, { a: 1, b: 1 }],
    },
    {
      list: [{ a: 0, b: 0 }, { a: 1, b: 2 }],
    },
  );
});
