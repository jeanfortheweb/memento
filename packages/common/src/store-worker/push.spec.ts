import { TestState, InnerTestProps, wire } from './test/helpers';
import push, { accept } from './push';

test('push creates the expected task object', () => {
  expect(
    push<TestState, InnerTestProps>('list', {
      a: 2,
      b: 3,
    }),
  ).toMatchObject({
    kind: '@STATE_WORKER/PUSH',
    path: 'list',
    data: [
      {
        a: 2,
        b: 3,
      },
    ],
  });
});

test('push produces the expected output state', async () => {
  const run = wire<TestState>(accept, new TestState());

  await run(
    push<TestState, InnerTestProps>(
      'list',
      {
        a: 1,
        b: 2,
      },
      {
        a: 3,
        b: 4,
      },
    ),
    {
      list: [{ a: 0, b: 0 }],
    },
    {
      list: [{ a: 0, b: 0 }, { a: 1, b: 2 }, { a: 3, b: 4 }],
    },
  );
});
