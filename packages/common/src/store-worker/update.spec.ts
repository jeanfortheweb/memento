import { TestState, InnerTestProps, wire } from './test/helpers';
import update, { accept } from './update';

test('update creates the expected task object', () => {
  const updater = jest.fn();

  expect(update<TestState>(updater)).toMatchObject({
    kind: '@STATE_WORKER/UPDATE',
    updater,
  });
});

test('update produces the expected output state', async () => {
  const run = wire<TestState>(accept, new TestState());

  await run(
    update<TestState>(state => state.set('a', 'foo')),
    {
      a: '',
    },
    {
      a: 'foo',
    },
  );
});
