import { State, Expect, Store } from '@memento/probe';
import { save, accept, KIND, SaveTask } from './save';
import { Configuration, Target, SaveMode, LoadMode } from './configuration';
import { getStorageKey } from './utils';

const name = 'test';
const key = getStorageKey(name);
const state = State.defaultState;

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  jest.resetAllMocks();
});

test('toString() outputs the kind as string', () => {
  expect(save.toString()).toEqual(KIND);
});

test('sets valid data on a local storage key when manually saved', async () => {
  const configuration: Configuration = {
    name,
    target: Target.Local,
    save: SaveMode.Manual,
    load: LoadMode.Auto,
    path: 'addresses',
  };

  const store = new Store(state, accept(configuration));

  await store.assign(
    save(name),
    new Expect.TaskAssignment<State, SaveTask>({
      kind: KIND,
      payload: name,
    }),
  );

  expect(localStorage.setItem).toHaveBeenLastCalledWith(
    key,
    JSON.stringify(state.addresses.toJS()),
  );
});

test('sets valid data on a session storage key when manually saved', async () => {
  const configuration: Configuration = {
    name,
    target: Target.Session,
    save: SaveMode.Manual,
    load: LoadMode.Auto,
    path: 'addresses.0',
  };

  const store = new Store(state, accept(configuration));

  await store.assign(
    save(name),
    new Expect.TaskAssignment<State, SaveTask>({
      kind: KIND,
      payload: name,
    }),
  );

  expect(sessionStorage.setItem).toHaveBeenLastCalledWith(
    key,
    JSON.stringify((state.addresses.get(0) as any).toJS()),
  );
});

test('sets valid data on a local storage key when state changes', async () => {
  const configuration: Configuration = {
    name,
    target: Target.Local,
    save: SaveMode.Auto,
    load: LoadMode.Auto,
    path: 'addresses',
  };

  const store = new Store(state, accept(configuration));
  const nextState = state.update('addresses', addresses => addresses.remove(0));

  await store.update(state => nextState, new Expect.StateChange<State>(state, nextState));

  expect(localStorage.setItem).toHaveBeenLastCalledWith(
    key,
    JSON.stringify(nextState.addresses.toJS()),
  );
});

test('sets valid data on a session storage key when state changes', async () => {
  const configuration: Configuration = {
    name,
    target: Target.Session,
    save: SaveMode.Auto,
    load: LoadMode.Auto,
    path: 'addresses',
  };

  const store = new Store(state, accept(configuration));
  const nextState = state.update('addresses', addresses => addresses.remove(0));

  await store.update(state => nextState, new Expect.StateChange<State>(state, nextState));

  expect(sessionStorage.setItem).toHaveBeenLastCalledWith(
    key,
    JSON.stringify(nextState.addresses.toJS()),
  );
});

test('sets valid data on a local storage key in a fixed interval', async () => {
  const configuration: Configuration = {
    name,
    target: Target.Local,
    save: SaveMode.Interval,
    interval: 500,
    load: LoadMode.Auto,
    path: 'addresses',
  };

  const store = new Store(state, accept(configuration));
  const nextState = state.update('addresses', addresses => addresses.remove(0));

  await store.update(state => nextState, new Expect.StateChange<State>(state, nextState));

  await new Promise(resolve => setTimeout(() => resolve(), 600));

  expect(localStorage.setItem).toHaveBeenLastCalledWith(
    key,
    JSON.stringify(nextState.addresses.toJS()),
  );
});

test('sets valid data on a session storage key in a fixed interval', async () => {
  const configuration: Configuration = {
    name,
    target: Target.Session,
    save: SaveMode.Interval,
    interval: 500,
    load: LoadMode.Auto,
    path: 'addresses',
  };

  const store = new Store(state, accept(configuration));
  const nextState = state.update('addresses', addresses => addresses.remove(0));

  await store.update(state => nextState, new Expect.StateChange<State>(state, nextState));

  await new Promise(resolve => setTimeout(() => resolve(), 600));

  expect(sessionStorage.setItem).toHaveBeenLastCalledWith(
    key,
    JSON.stringify(nextState.addresses.toJS()),
  );
});
