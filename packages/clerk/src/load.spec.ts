import { State, Expect, Store } from '@memento/probe';
import createReviver from '@memento/reviver';
import { load, accept, KIND, LoadTask } from './load';
import { Configuration, Target, LoadMode } from './configuration';
import { getStorageKey } from './utils';

const name = 'test';
const key = getStorageKey(name);
const state = State.defaultState;
const savedState = state.update('addresses', addresses => addresses.remove(0));

const addressesReviver = createReviver(sequence =>
  sequence.toList().map(address => new State.Address(address)),
);

const configurationReviver = createReviver<
  State.Configuration.Props,
  State.Configuration
>(sequence => new State.Configuration(sequence), {
  includes: sequence => sequence.toList(),
});

const stateReviver = createReviver<State.Props, State>(sequence => new State(sequence), {
  addresses: addressesReviver,
  configuration: configurationReviver,
});

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
