import { TestState, InnerTestProps, wire } from './test/helpers';
import set, { accept } from './set';

test('set creates the expected task object', () => {
  expect(
    set<TestState, InnerTestProps>('a.child', {
      a: 2,
      b: 3,
    }),
  ).toMatchObject({
    kind: '@STATE_WORKER/SET',
    path: 'a.child',
    data: {
      a: 2,
      b: 3,
    },
  });
});

test('set produces the expected output state', async () => {
  const run = wire<TestState>(accept, new TestState());

  await run(
    set<TestState, string>('a', 'foo'),
    {
      a: '',
    },
    {
      a: 'foo',
    },
  );
});
