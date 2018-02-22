import { setup, State, Expect } from '@memento/probe';
import merge, { accept, KIND, MergeTask } from './merge';

const defaultState = State.defaultState;
const run = setup<State>(defaultState)(accept);

test('toString() ouputs the kind as string', () => {
  expect(merge.toString()).toEqual(KIND);
});

test('produces the expected output state', async () => {
  await run(
    merge({
      host: 'github.com',
    }),
    new Expect.TaskAssignment<State, MergeTask<State>>({
      kind: KIND,
      payload: {
        host: 'github.com',
      },
    }),
    new Expect.StateChange<State>(defaultState, defaultState.set('host', 'github.com')),
  );
});
