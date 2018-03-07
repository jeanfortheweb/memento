import { State, Expect, Store } from '@memento/probe';
import throttle, { accept, KIND, ThrottleTask } from './throttle';
import { Task } from '@memento/store';

const defaultState = State.defaultState;
const store = new Store(defaultState, accept);

beforeEach(() => {
  store.reset();
});

test('toString() outputs the kind as string', () => {
  expect(throttle.toString()).toEqual(KIND);
});

test('assigns task after specified duration', async () => {
  const duration = 1000;
  const creator = jest.fn((): Task => ({ kind: 'THROTTLED', payload: null }));

  await store.assign(
    throttle(duration, creator),
    new Expect.TaskAssignment<State, ThrottleTask>({
      kind: KIND,
      payload: {
        duration,
        creator,
      },
    }),
    new Expect.TaskAssignment({
      kind: 'THROTTLED',
      payload: null,
    }),
  );

  await store.assign(throttle(duration, creator));
  await store.assign(throttle(duration, creator));
  await store.assign(throttle(duration, creator));
  await store.assign(throttle(duration, creator));
  await store.assign(throttle(duration, creator));

  expect(creator).toHaveBeenCalledTimes(1);
  expect(store.history.task.size).toEqual(7);
});
