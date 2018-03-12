import { State, Expect, Store } from '@memento/probe';
import { load, accept, KIND, LoadTask } from './load';
import { Configuration, Target, LoadMode, Reviver } from './configuration';
import { getStorageKey } from './utils';

const name = 'test';
const key = getStorageKey(name);
const state = State.defaultState;
const savedState = state.update('addresses', addresses => addresses.remove(0));
const addressesReviver: Reviver = (key, sequence, path) => {
  if (typeof key === 'number') {
    return new State.Address(sequence);
  }

  return sequence.toList();
};

const stateReviver: Reviver = (key, sequence, path) => {
  const [root] = path || [undefined];

  if (key === 'addresses') {
    return sequence.toList();
  }

  if (typeof key === 'number' && root === 'addresses') {
    return new State.Address(sequence);
  }

  return new State(sequence);
};

beforeAll(() => {
  localStorage.setItem(getStorageKey(name), JSON.stringify(savedState.addresses));
  sessionStorage.setItem(getStorageKey(name), JSON.stringify(savedState.addresses));
});

test('toString() outputs the kind as string', () => {
  expect(load.toString()).toEqual(KIND);
});

test('sets valid data on the state when manually loaded', async () => {
  localStorage.setItem(getStorageKey(name), JSON.stringify(savedState));

  const configuration: Configuration = {
    name,
    target: Target.Local,
    load: LoadMode.Manual,
    reviver: stateReviver,
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

  expect(localStorage.getItem).toHaveBeenLastCalledWith(key);
});

test('sets valid data on the state when automatically loaded', async () => {
  const configuration: Configuration = {
    name,
    target: Target.Session,
    load: LoadMode.Auto,
    path: 'addresses',
    reviver: addressesReviver,
  };

  const store = new Store(state, accept(configuration));

  await new Promise(resolve => setTimeout(() => resolve(), 10));

  expect((store.history.state.last() as State).toJS()).toMatchObject(savedState.toJS());
  expect(localStorage.getItem).toHaveBeenLastCalledWith(key);
});

test('keeps state unchanged when no data is stored', async () => {
  const configuration: Configuration = {
    name,
    target: Target.Session,
    load: LoadMode.Auto,
    path: 'addresses',
    reviver: addressesReviver,
  };

  sessionStorage.removeItem(getStorageKey(name));

  const store = new Store(state, accept(configuration));

  await new Promise(resolve => setTimeout(() => resolve(), 10));

  expect(store.history.state.size).toEqual(1);
});
