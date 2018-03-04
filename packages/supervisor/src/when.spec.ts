import { State, Expect, Store } from '@memento/probe';
import when, { accept, KIND, WhenTask } from './when';
import { Task } from '@memento/store';

const defaultState = State.defaultState;
const store = new Store(defaultState, accept);

beforeEach(() => {
  store.reset();
});

test('toString() ouputs the kind as string', () => {
  expect(when.toString()).toEqual(KIND);
});

test('assigns the task when the predicate returns true', async () => {
  const predicate = jest.fn(state => state.port !== 0);
  const creator = jest.fn((): Task => ({ kind: 'WHEN_TRUE', payload: null }));

  await store.run(
    when<State>(predicate, creator),
    new Expect.TaskAssignment<State, WhenTask<State>>({
      kind: KIND,
      payload: {
        predicate,
        creator,
      },
    }),
  );

  expect(predicate).toHaveBeenCalledTimes(1);
  expect(creator).toBeCalled();
});

test("doesn't assign the task when the predicate returns false", async () => {
  const predicate = jest.fn(state => state.host === 0);
  const creator = jest.fn((): Task => ({ kind: 'WHEN_TRUE', payload: null }));

  await store.run(
    when<State>(predicate, creator),
    new Expect.TaskAssignment<State, WhenTask<State>>({
      kind: KIND,
      payload: {
        predicate,
        creator,
      },
    }),
  );

  expect(predicate).toHaveBeenCalledTimes(1);
  expect(creator).not.toBeCalled();
});
