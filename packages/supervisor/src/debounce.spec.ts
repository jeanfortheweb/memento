import { State, Expect, Store } from '@memento/probe';
import debounce, { accept, KIND, DebounceTask } from './debounce';
import { Task } from '@memento/store';

const defaultState = State.defaultState;
const store = new Store(defaultState, accept);

beforeEach(() => {
  store.reset();
});

test('toString() ouputs the kind as string', () => {
  expect(debounce.toString()).toEqual(KIND);
});

test('debounces tasks in specified duration', done => {
  const duration = 1000;
  const creator = jest.fn((): Task => {
    expect(store.history.task.size).toEqual(4);

    done();

    return { kind: 'DEBOUNCED', payload: null };
  });

  store.assign(debounce(duration, creator));
  store.assign(debounce(duration, creator));
  store.assign(debounce(duration, creator));

  store.assign(
    debounce(duration, creator),
    new Expect.TaskAssignment<State, DebounceTask>({
      kind: KIND,
      payload: {
        duration,
        creator,
      },
    }),
    new Expect.TaskAssignment({
      kind: 'DEBOUNCED',
      payload: null,
    }),
  );
});
