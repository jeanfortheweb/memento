import { setup, State, Expect } from '@memento/probe';
import merge, { accept, KIND, MergeTask } from './merge';

const defaultState = State.defaultState;
const assign = setup<State>(defaultState)(accept);

test('toString() outputs the kind as string', () => {
  expect(merge.toString()).toEqual(KIND);
});

test('produces the expected output state', async () => {
  await assign(
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
