import { Record } from 'immutable';

import Store, { Task, Listener, Updater, Worker, TaskObservable } from './';
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

test('store does forward assigned tasks to workers', () => {
  interface TestTask extends Task<State> {
    kind: 'TEST';
    value: number;
  }

  const task: TestTask = {
    kind: 'TEST',
    value: 52,
  };

  const updater = jest.fn();
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
