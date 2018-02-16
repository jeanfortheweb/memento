import { List } from 'immutable';
import { TestProps, TestState, InnerTestProps, wire } from './test/helpers';
import merge, { accept } from './merge';

test('merge creates the expected task object', () => {
  expect(
    merge<TestState, TestProps>({
      a: 'a',
      child: {
        a: 2,
        b: 3,
      },
    }),
  ).toMatchObject({
    kind: '@STATE_WORKER/MERGE',
    data: {
      a: 'a',
      child: {
        a: 2,
        b: 3,
      },
    },
  });
});

test('merge produces the expected output state', async () => {
  const run = wire<TestState>(accept, new TestState());

  await run(
    merge<TestState, TestProps>({
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
    merge<TestState, TestProps>({
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
    merge<TestState, TestProps>({
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
