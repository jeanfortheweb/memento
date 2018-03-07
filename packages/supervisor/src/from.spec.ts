import { State, Expect, Store } from '@memento/probe';
import from, { accept, KIND, FromTask } from './from';
import { Task } from '@memento/store';

const defaultState = State.defaultState;
const store = new Store(defaultState, accept);

beforeEach(() => {
  store.reset();
});

test('toString() ouputs the kind as string', () => {
  expect(from.toString()).toEqual(KIND);
});

test('injects the selected value into the creator', async () => {
  const selector = jest.fn(state => state.host);
  const creator = jest.fn((host: string): Task => ({
    kind: 'TRIGGER_HOST',
    payload: host,
  }));

  await store.assign(
    from<State, string>(selector, creator),
    new Expect.TaskAssignment<State, FromTask<State, string>>({
      kind: KIND,
      payload: {
        selector,
        creator,
      },
    }),
    new Expect.TaskAssignment({
      kind: 'TRIGGER_HOST',
      payload: defaultState.host,
    }),
  );

  expect(selector).toHaveBeenCalledTimes(1);
  expect(creator).toBeCalledWith(defaultState.host);
});
