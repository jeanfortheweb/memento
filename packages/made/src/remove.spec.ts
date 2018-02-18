import { TestState, InnerTestProps, wire } from './test/helpers';
import { List } from 'immutable';
import remove, { accept, KIND } from './remove';

const item1 = { a: 0, b: 0 };
const item2 = { a: 1, b: 1 };

test('creates the expected task object', () => {
  expect(remove<InnerTestProps>('list', item1)).toMatchObject({
    kind: KIND,
    payload: {
      path: 'list',
      data: [item1],
    },
  });

  expect(remove.toString()).toEqual(KIND);
});

test('produces the expected output state', async () => {
  const run = wire<TestState>(
    accept,
    new TestState({
      list: List([item1, item2, { a: 2, b: 2 }]),
    }),
  );

  await run(
    remove<InnerTestProps>('list', item1, item2),
    {
      list: [{ a: 0, b: 0 }, { a: 1, b: 1 }, { a: 2, b: 2 }],
    },
    {
      list: [{ a: 2, b: 2 }],
    },
  );
});
