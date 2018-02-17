import { State, TaskA, taskA, TaskB, taskB } from './test/mocks';
import { Store } from './';
import TaskSubject from './TaskSubject';
import StateSubject from './StateSubject';

test('does invoke workers and subscribe to them', () => {
  const subscribe = jest.fn();
  const worker = jest.fn((task$, state$) => {
    expect(task$).toBeInstanceOf(TaskSubject);
    expect(state$).toBeInstanceOf(StateSubject);

    return { subscribe };
  });

  new Store(new State(), [worker]);

  expect(worker).toBeCalled();
  expect(subscribe).toBeCalled();
});

test('does call emitted updaters', () => {
  const initialState = new State();
  const updater = jest.fn();
  const worker = jest.fn(task$ => task$.mapTo({}).startWith(updater));

  new Store(initialState, [worker]);

  expect(updater).toBeCalledWith(initialState);
});

test('does emit tasks and calls resulting updaters', () => {
  const initialState = new State();
  const updater = jest.fn();
  const worker = jest.fn((task$: TaskSubject) =>
    task$.accept<TaskA>('@TEST/TASK_A').mapTo(updater),
  );

  new Store(initialState, [worker]).assign(taskA);

  expect(updater).toBeCalledWith(initialState);
});

test('does emit tasks and forwards resulting tasks', () => {
  const initialState = new State();
  const updater = jest.fn(state => state);
  const workerA = jest.fn((task$: TaskSubject) => task$.accept<TaskA>('@TEST/TASK_A').mapTo(taskB));
  const workerB = jest.fn((task$: TaskSubject) =>
    task$.accept<TaskB>('@TEST/TASK_B').mapTo(updater),
  );

  new Store(initialState, [workerA, workerB]).assign(taskA);

  expect(updater).toBeCalledWith(initialState);
});

test('does emit state changes', () => {
  const initialState = new State();
  const nextState = initialState.set('propertyA', 'foo');
  const updater = jest.fn(state => state);

  const workerA = jest.fn((task$: TaskSubject, state$: StateSubject<State>) =>
    task$.mapTo(state => nextState),
  );

  const workerB = jest.fn((task$: TaskSubject, state$: StateSubject<State>) =>
    state$.select(state => state.propertyA).map(propertyA => updater(propertyA)),
  );

  new Store(initialState, [workerA, workerB]).assign(taskA);

  expect(updater).toBeCalledWith(nextState.propertyA);
});

test('does invoke listeners on state changes', () => {
  const initialState = new State();
  const nextState = initialState.set('propertyA', 'foo');
  const listener = jest.fn();

  const worker = jest.fn((task$: TaskSubject, state$: StateSubject<State>) =>
    task$.mapTo(state => nextState),
  );

  const store = new Store(initialState, [worker]);

  const stop = store.listen(listener);
  store.assign(taskA);

  expect(listener).toBeCalledWith(initialState, nextState);

  stop();

  expect(listener).toHaveBeenCalledTimes(1);
});

test('does invoke selectors on current state', () => {
  const initialState = new State();
  const selector = jest.fn(state => state.propertyA);
  const store = new Store(initialState, []);

  expect(store.select(selector)).toEqual(initialState.propertyA);
});
