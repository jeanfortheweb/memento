import { Record } from 'immutable';

import Store, {
  Task,
  Listener,
  Updater,
  Worker,
  TaskObservable,
  Selector,
  StateObservable,
} from './';
import { Observable } from '@reactivex/rxjs';

class State extends Record<{ property: string }>({ property: 'value' }) {}

test('store does invoke workers and subscribe to them', () => {
  const subscribe = jest.fn();

  const worker = jest.fn<Worker<State>>().mockImplementation(task$ => {
    expect(task$).toBeInstanceOf(Observable);
    return { subscribe };
  });

  new Store(new State(), [worker]);

  expect(worker).toBeCalled();
  expect(subscribe).toBeCalled();
});

test('store does call emitted updaters', () => {
  const updater = jest.fn();
  const initialState = new State();

  const worker = jest
    .fn<Worker<State>>()
    .mockImplementation(task$ => task$.mapTo({}).startWith(updater));

  new Store(initialState, [worker]);

  expect(updater).toBeCalledWith(initialState);
});

test('store does emit emitted tasks', () => {
  const updater = jest.fn();

  const taskA: Task<State> = {
    kind: 'TASK_A',
  };
  const taskB: Task<State> = {
    kind: 'TASK_B',
  };

  const initialState = new State();

  const worker = jest.fn<Worker<State>>(task$ =>
    Observable.merge(task$.accept('TASK_A').mapTo(taskB), task$.accept('TASK_B').mapTo(updater)),
  );

  const store = new Store(initialState, [worker]);
  store.assign(taskA);

  expect(updater).toBeCalledWith(initialState);
});

test('store does forward assigned tasks to workers', () => {
  interface TestTask extends Task<State> {
    kind: 'TEST';
    value: number;
  }

  const task: TestTask = {
    kind: 'TEST',
    value: 52,
  };

  const updater = jest.fn(state => state);
  const initialState = new State();

  const worker = jest
    .fn<Worker<State>>()
    .mockImplementation((task$: TaskObservable<State>) =>
      task$.accept<TestTask>('TEST').mapTo(updater),
    );

  const store = new Store(initialState, [worker]);
  store.assign(task);

  expect(updater).toBeCalledWith(initialState);
});

test('store does forward state changes to workers', () => {
  interface TestTask extends Task<State> {
    kind: 'TEST';
    value: string;
  }

  const taskToUpdater = jest.fn(value => state => state.set('property', value));
  const selectionToUpdater = jest.fn(value => state => state);
  const initialState = new State();

  const updateWorker = jest
    .fn<Worker<State>>()
    .mockImplementation((task$: TaskObservable<State>) =>
      task$.accept<TestTask>('TEST').map(task => taskToUpdater(task.value)),
    );

  const watchWorker = jest
    .fn<Worker<State>>()
    .mockImplementation((task$: TaskObservable<State>, state$: StateObservable<State>) =>
      state$.select(state => state.property).map(selectionToUpdater),
    );

  const store = new Store(initialState, [updateWorker, watchWorker]);

  store.assign({
    kind: 'TEST',
    value: 'differentValue',
  } as TestTask);

  store.assign({
    kind: 'TEST',
    value: 'differentValue',
  } as TestTask);

  store.assign({
    kind: 'TEST',
    value: 'more different',
  } as TestTask);

  expect(taskToUpdater.mock.calls.length).toEqual(3);
  expect(taskToUpdater.mock.calls.map(args => args[0])).toEqual([
    'differentValue',
    'differentValue',
    'more different',
  ]);

  expect(selectionToUpdater.mock.calls.length).toEqual(3);
  expect(selectionToUpdater.mock.calls.map(args => args[0])).toEqual([
    'value',
    'differentValue',
    'more different',
  ]);
});

test('store does invoke listeners when state changes', () => {
  const task: Task<State> = {
    kind: 'TEST',
  };

  let nextState;

  const updater: Updater<State> = state => {
    nextState = state.set('property', 'anotherValue');
    return nextState;
  };

  const listener = jest.fn<Listener<State>>();
  const initialState = new State();

  const worker = jest.fn<Worker<State>>().mockImplementation(task$ => task$.mapTo(updater));

  const store = new Store(initialState, [worker]);
  const unlisten = store.listen(listener);
  store.assign(task);

  expect(listener).toBeCalledWith(initialState, nextState);

  store.assign(task);

  expect(listener).toHaveBeenCalledTimes(1);

  unlisten();
  store.assign(task);

  expect(listener).toHaveBeenCalledTimes(1);
});

test('selector gets called', () => {
  const initialState = new State();
  const selector = jest.fn<Selector<State, string>>().mockImplementation(state => state.property);

  const store = new Store(initialState, []);
  const selection = store.select(selector);

  expect(selection).toEqual('value');
});
