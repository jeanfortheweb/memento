import { List } from 'immutable';
import { TestProps, TestState, wire } from './test/helpers';
import merge, { accept, KIND } from './merge';

test('creates the expected task object', () => {
  expect(
    merge<TestProps>({
      a: 'a',
      child: {
        a: 2,
        b: 3,
      },
    }),
  ).toMatchObject({
    kind: KIND,
    payload: {
      a: 'a',
      child: {
        a: 2,
        b: 3,
      },
    },
  });

  expect(merge.toString()).toEqual(KIND);
});

test('produces the expected output state', async () => {
  const run = wire<TestState>(accept, new TestState());

  await run(
    merge<TestProps>({
      a: 'a',
      child: {
        a: 2,
        b: 3,
      },
    }),
    {
      a: '',
      child: {
        a: 0,
        b: 0,
      },
    },
    {
      a: 'a',
      child: {
        a: 2,
        b: 3,
      },
    },
  );

  await run(
    merge<TestProps>({
      a: 'a',
      list: List([{ a: 2, b: 2 }, { a: 1, b: 1 }]),
    }),
    {
      a: '',
      list: [{ a: 0, b: 0 }],
    },
    {
      a: 'a',
      list: [{ a: 2, b: 2 }, { a: 1, b: 1 }],
    },
  );

  await run(
    merge<TestProps>({
      list: List([{ a: 5, b: 5 }]),
    }),
    {
      list: [{ a: 0, b: 0 }],
    },
    {
      list: [{ a: 5, b: 5 }],
    },
  );
});
