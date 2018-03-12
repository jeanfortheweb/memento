import { setup, State, Expect } from '@memento/probe';
import increase, { accept, KIND, IncreaseTask } from './increase';

const defaultState = State.defaultState;
const assign = setup<State>(defaultState)(accept);

test('toString() outputs the kind as string', () => {
  expect(increase.toString()).toEqual(KIND);
});

test('produces the expected output state when passing no delta value', async () => {
  await assign(
    increase('port'),
    new Expect.TaskAssignment<State, IncreaseTask>({
      kind: KIND,
      payload: {
        path: 'port',
        delta: 1,
      },
    }),
    new Expect.StateChange<State>(
      defaultState,
      defaultState.set('port', defaultState.port + 1),
    ),
  );
});

test('produces the expected output state when passing numeric delta value', async () => {
  await assign(
    increase('port', 10),
    new Expect.TaskAssignment<State, IncreaseTask>({
      kind: KIND,
      payload: {
        path: 'port',
        delta: 10,
      },
    }),
    new Expect.StateChange<State>(
      defaultState,
      defaultState.set('port', defaultState.port + 10),
    ),
  );
});

test('produces the expected output state when passing path as delta value', async () => {
  await assign(
    increase('port', 'port'),
    new Expect.TaskAssignment<State, IncreaseTask>({
      kind: KIND,
      payload: {
        path: 'port',
        delta: 'port',
      },
    }),
    new Expect.StateChange<State>(
      defaultState,
      defaultState.set('port', defaultState.port + defaultState.port),
    ),
  );
});
