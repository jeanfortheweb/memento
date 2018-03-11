import { State, Expect, Store } from '@memento/probe';
import { load, accept, KIND, LoadTask } from './load';
import { Configuration, Target, SaveMode, LoadMode, Reviver } from './configuration';
import { getStorageKey } from './utils';

const name = 'test';
const key = getStorageKey(name);
const state = State.defaultState;
const savedState = state.update('addresses', addresses => addresses.remove(0));
const reviver: Reviver = (key, sequence, path) => {
  if (typeof key === 'number') {
    return new State.Address(sequence);
  }

  return sequence.toList();
};

beforeAll(() => {
  localStorage.setItem(getStorageKey(name), JSON.stringify(savedState.addresses));
  sessionStorage.setItem(getStorageKey(name), JSON.stringify(savedState.addresses));
});

test('toString() outputs the kind as string', () => {
  expect(load.toString()).toEqual(KIND);
});

test('sets valid data on the state when manually loaded', async () => {
  const configuration: Configuration = {
    name,
    target: Target.Local,
    save: SaveMode.Manual,
    load: LoadMode.Manual,
    path: 'addresses',
    reviver,
  };

  const store = new Store(state, accept(configuration));

  await store.assign(
    load(name),
    new Expect.TaskAssignment<State, LoadTask>({
      kind: KIND,
      payload: name,
    }),
    new Expect.StateChange<State>(state, savedState),
  );

  await new Promise(resolve => setTimeout(() => resolve(), 10));

  expect(localStorage.getItem).toHaveBeenLastCalledWith(key);
});

test('sets valid data on the state when automatically loaded', async () => {
  const configuration: Configuration = {
    name,
    target: Target.Session,
    save: SaveMode.Manual,
    load: LoadMode.Auto,
    path: 'addresses',
    reviver,
  };

  const store = new Store(state, accept(configuration));

  await new Promise(resolve => setTimeout(() => resolve(), 10));

  expect((store.history.state.last() as State).toJS()).toMatchObject(savedState.toJS());
  expect(localStorage.getItem).toHaveBeenLastCalledWith(key);
});

test('invokes empty creator when there is nothing to load', async () => {
  const empty = jest.fn(() => ({ kind: 'empty' }));
  const configuration: Configuration = {
    name,
    target: Target.Session,
    save: SaveMode.Manual,
    load: LoadMode.Auto,
    empty,
    path: 'addresses',
    reviver,
  };

  sessionStorage.removeItem(getStorageKey(name));

  new Store(state, accept(configuration));

  await new Promise(resolve => setTimeout(() => resolve(), 10));

  expect(empty).toHaveBeenCalledTimes(1);
});
