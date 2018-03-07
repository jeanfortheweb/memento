import { State, Expect, Store } from '@memento/probe';
import delay, { accept, KIND, DelayTask } from './delay';
import { Task } from '@memento/store';

const defaultState = State.defaultState;
const store = new Store(defaultState, accept);

beforeEach(() => {
  store.reset();
});

test('toString() ouputs the kind as string', () => {
  expect(delay.toString()).toEqual(KIND);
});

test('assigns task after specified duration', async () => {
  const duration = 1000;
  const creator = jest.fn((host: string): Task => ({
    kind: 'DELAYED',
    payload: null,
  }));

  const now = Date.now();

  await store.assign(
    delay(duration, creator),
    new Expect.TaskAssignment<State, DelayTask>({
      kind: KIND,
      payload: {
        duration,
        creator,
      },
    }),
    new Expect.TaskAssignment({
      kind: 'DELAYED',
      payload: null,
    }),
  );

  const time = Date.now() - now;

  expect(time).toBeLessThan(1050);
  expect(time).toBeGreaterThanOrEqual(1000);
  expect(creator).toHaveBeenCalledTimes(1);
});
