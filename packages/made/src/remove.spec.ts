import { TestState, InnerTestProps, wire } from './test/helpers';
import { List } from 'immutable';
import remove, { accept } from './remove';

test('remove creates the expected task object', () => {
  expect(
    remove<TestState, InnerTestProps>('list', {
      a: 2,
      b: 3,
    }),
  ).toMatchObject({
    kind: '@STATE_WORKER/REMOVE',
    path: 'list',
    data: [
      {
        a: 2,
        b: 3,
      },
    ],
  });
});

test('remove produces the expected output state', async () => {
  const item1 = { a: 0, b: 0 };
  const item2 = { a: 1, b: 1 };
  const run = wire<TestState>(
    accept,
    new TestState({
      list: List([item1, item2, { a: 2, b: 2 }]),
    }),
  );

  await run(
    remove<TestState, InnerTestProps>('list', item1, item2),
    {
      list: [{ a: 0, b: 0 }, { a: 1, b: 1 }, { a: 2, b: 2 }],
    },
    {
      list: [{ a: 2, b: 2 }],
    },
  );
});
