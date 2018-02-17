import { State, TaskA, taskA, TaskB, taskB } from './test/mocks';
import { Store } from './';
import TaskSubject from './TaskSubject';
import StateSubject from './StateSubject';

const initialState = new State();
const changedState = initialState.set('propertyA', 'foo');
const updater = jest.fn();

const workerA = jest.fn(task$ => task$.mapTo({}).startWith(updater));
const workerB = jest.fn(task$ => task$.mapTo({}).startWith(updater));

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
  new Store(initialState, [workerA]);

  expect(updater).toBeCalledWith(initialState);
});

test('does emit tasks and calls resulting updaters', () => {
  workerA.mockImplementation((task$: TaskSubject) =>
    task$.accept<TaskA>('@TEST/TASK_A').mapTo(updater),
  );

  new Store(initialState, [workerA]).assign(taskA);

  expect(updater).toBeCalledWith(initialState);
});

test('does emit tasks and forwards resulting tasks', () => {
  updater.mockImplementation(state => state);

  workerA.mockImplementation((task$: TaskSubject) =>
    task$.accept<TaskA>('@TEST/TASK_A').mapTo(taskB),
  );

  workerB.mockImplementation((task$: TaskSubject) =>
    task$.accept<TaskB>('@TEST/TASK_B').mapTo(updater),
  );

  new Store(initialState, [workerA, workerB]).assign(taskA);

  expect(updater).toBeCalledWith(initialState);
});

test('does emit state changes', () => {
  updater.mockImplementation(state => state);

  workerA.mockImplementation((task$: TaskSubject, state$: StateSubject<State>) =>
    task$.mapTo(state => changedState),
  );

  workerB.mockImplementation((task$: TaskSubject, state$: StateSubject<State>) =>
    state$.select(state => state.propertyA).map(propertyA => updater(propertyA)),
  );

  new Store(initialState, [workerA, workerB]).assign(taskA);

  expect(updater).toBeCalledWith(changedState.propertyA);
});

test('does invoke listeners on state changes', () => {
  const listener = jest.fn();
  const store = new Store(initialState, [workerA]);
  const stop = store.listen(listener);

  store.assign(taskA);

  expect(listener).toBeCalledWith(initialState, changedState);

  stop();

  expect(listener).toHaveBeenCalledTimes(1);
});

test('does invoke selectors on current state', () => {
  const selector = jest.fn(state => state.propertyA);
  const store = new Store(initialState, []);

  expect(store.select(selector)).toEqual(initialState.propertyA);
});
