import { TestState, InnerTestProps, wire } from './test/helpers';
import set, { accept, KIND } from './set';

test('creates the expected task object', () => {
  expect(
    set<InnerTestProps>('a.child', {
      a: 2,
      b: 3,
    }),
  ).toMatchObject({
    kind: KIND,
    payload: {
      path: 'a.child',
      data: {
        a: 2,
        b: 3,
      },
    },
  });

  expect(set.toString()).toEqual(KIND);
});

test('produces the expected output state', async () => {
  const run = wire<TestState>(accept, new TestState());

  await run(
    set<string>('a', 'foo'),
    {
      a: '',
    },
    {
      a: 'foo',
    },
  );
});
