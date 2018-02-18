import { TestState, InnerTestProps, wire } from './test/helpers';
import push, { accept, KIND } from './push';

test('creates the expected task object', () => {
  expect(
    push<InnerTestProps>('list', {
      a: 2,
      b: 3,
    }),
  ).toMatchObject({
    kind: KIND,
    payload: {
      path: 'list',
      data: [
        {
          a: 2,
          b: 3,
        },
      ],
    },
  });

  expect(push.toString()).toEqual(KIND);
});

test('produces the expected output state', async () => {
  const run = wire<TestState>(accept, new TestState());

  await run(
    push<InnerTestProps>(
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
