import { Record } from 'immutable';

import Action from './Action';
import Task from './Task';
import Store from './Store';
import Worker from './Worker';
import { Listener, Updater } from '../core';

class State extends Record<{ property: string }>({ property: 'value' }) {}

const MockAction = jest.fn<Action<State>>(() => ({
  dispatch: jest.fn(),
}));

const mockActionInstance = new MockAction();

const MockTask = jest.fn<Task<State>>();
const MockTask2 = jest.fn<Task<State>>();

const MockWorker = jest.fn<Worker<State, MockTask>>(() => ({
  for: jest.fn().mockReturnValue(MockTask),
  setup: jest.fn().mockImplementation(task$ => task$.map(() => mockActionInstance)),
}));

test('store setups workers on construction', () => {
  const mockWorkerInstance = new MockWorker();

  new Store(new State(), [mockWorkerInstance]);

  expect(mockWorkerInstance.setup).toBeCalled();
});

test('a different task does not reach target worker', () => {
  const mockWorkerInstance = new MockWorker();
  const store = new Store(new State(), [mockWorkerInstance]);

  store.assign(new MockTask2());

  expect(mockActionInstance.dispatch).toHaveBeenCalledTimes(0);
});

test('task reaches target worker', () => {
  const mockWorkerInstance = new MockWorker();
  const store = new Store(new State(), [mockWorkerInstance]);

  store.assign(new MockTask());

  expect(mockWorkerInstance.for).toBeCalled();
  expect(mockActionInstance.dispatch).toHaveBeenCalledTimes(1);
});

test('action from worker gets dispatched', () => {
  const mockWorkerInstance = new MockWorker();
  const store = new Store(new State(), [mockWorkerInstance]);

  store.assign(new MockTask());

  expect(mockActionInstance.dispatch).toBeCalledWith(store);
});

test('update does evolve the state', () => {
  const initialState = new State();
  const store = new Store(initialState);
  const mockUpdater = jest.fn<Updater<State>>(state => state.set('property', 'anotherValue'));

  store.update(mockUpdater);

  expect(mockUpdater).toBeCalledWith(initialState);
});

test('listener gets called with correct states', done => {
  let nextState: State;

  const mockListener = jest.fn<Listener<State>>((prev, next) => {
    expect(prev).toEqual(initialState);
    expect(next).toBeDefined();
    expect(next !== initialState).toBeTruthy();
    expect(next.property).toEqual('anotherValue');

    done();
  });

  const initialState = new State();
  const store = new Store(initialState);
  const mockUpdater = jest.fn<Updater<State>>(state => {
    nextState = state.set('property', 'anotherValue');
    return nextState;
  });

  store.listen(mockListener);
  store.update(mockUpdater);
});

test('listener does not get called with same state', () => {
  const mockListener = jest.fn<Listener<State>>();
  const initialState = new State();
  const store = new Store(initialState);
  const mockUpdater = jest.fn<Updater<State>>(state => state.set('property', 'value'));

  store.listen(mockListener);
  store.update(mockUpdater);
  store.update(mockUpdater);

  expect(mockListener).toHaveBeenCalledTimes(0);
});

test('listener gets unregistered as expected', () => {
  const mockListener = jest.fn<Listener<State>>();
  const initialState = new State();
  const store = new Store(initialState);
  const mockUpdater = jest.fn<Updater<State>>(state => state.set('property', 'anotherValue'));

  store.listen(mockListener)();
  store.update(mockUpdater);

  expect(mockListener).toHaveBeenCalledTimes(0);
});
