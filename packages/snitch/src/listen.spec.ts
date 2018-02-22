import { Task, createTask } from '@memento/store';
import { Store, State, Expect } from '@memento/probe';
import { listen, accept, KIND_LISTEN, unlisten, KIND_UNLISTEN, KIND_LISTEN_ONCE } from './listen';

const KIND_A = '@TEST/KIND_A';
const KIND_B = '@TEST/KIND_B';

type TaskA = Task<typeof KIND_A, { propertyA: string; propertyB: string }>;
type TaskB = Task<typeof KIND_B, { propertyA: string }>;

const taskA = createTask(KIND_A, (propertyA: string, propertyB: string) => ({
  propertyA,
  propertyB,
}));

const taskB = createTask(KIND_B, (propertyA: string) => ({
  propertyA,
}));

const state = State.defaultState;
const store = new Store(state, accept);
const assign = jest.fn((payload: TaskA['payload']) => taskB(payload.propertyA));

const expectTaskToBeAssigned = async (task: Task) => {
  await store.run(task, new Expect.TaskAssignment<State, Task>(task));
};

const expectAssignmentFromListener = async (task: Task) => {
  await store.run(
    task,
    new Expect.TaskAssignment<State, Task>(task),
    new Expect.TaskAssignment<State, TaskB>({
      kind: KIND_B,
      payload: {
        propertyA: 'propertyA',
      },
    }),
  );
};

beforeEach(() => {
  store.reset();
  assign.mockClear();
});

test('toString() ouputs the kind as string', () => {
  expect(listen.toString()).toEqual(KIND_LISTEN);
  expect(listen.once.toString()).toEqual(KIND_LISTEN_ONCE);
  expect(unlisten.toString()).toEqual(KIND_UNLISTEN);
});

test('does invoke assign function on string targets', async () => {
  await expectTaskToBeAssigned(listen(KIND_A, assign));
  await expectAssignmentFromListener(taskA('propertyA', 'propertyB'));

  expect(assign).toHaveBeenCalledTimes(1);
});

test('does invoke assign with payload filter function returning true', async () => {
  const predicate = jest.fn(payload => payload.propertyA === 'propertyA');
  const task = taskA('propertyA', 'propertyB');

  await expectTaskToBeAssigned(listen(KIND_A, predicate, assign));
  await expectAssignmentFromListener(taskA('propertyA', 'propertyB'));

  expect(assign).toHaveBeenCalledTimes(1);
  expect(predicate).toHaveBeenCalledWith(task.payload);
});

test('does not invoke assign with payload filter function returning false', async () => {
  const predicate = jest.fn(payload => payload.propertyA !== 'propertyA');
  const task = taskA('propertyA', 'propertyB');

  await expectTaskToBeAssigned(listen(KIND_A, predicate, assign));
  await expectTaskToBeAssigned(task);

  expect(assign).toHaveBeenCalledTimes(0);
  expect(predicate).toHaveBeenCalledWith(task.payload);
});

test('does stop listening when unlisten is emitted', async () => {
  await expectTaskToBeAssigned(listen('foo', KIND_A, () => true, assign));
  await expectTaskToBeAssigned(listen('bar', KIND_A, assign));
  await expectAssignmentFromListener(taskA('propertyA', 'propertyB'));
  await expectTaskToBeAssigned(unlisten('foo'));
  await expectTaskToBeAssigned(taskA('propertyA', 'propertyB'));

  expect(assign).toHaveBeenCalledTimes(3);
});

test('does stop listening with once', async () => {
  await expectTaskToBeAssigned(listen.once(KIND_A, assign));
  await expectTaskToBeAssigned(listen.once(KIND_A, () => false, assign));
  await expectAssignmentFromListener(taskA('propertyA', 'propertyB'));
  await expectTaskToBeAssigned(taskA('propertyA', 'propertyB'));

  expect(assign).toHaveBeenCalledTimes(1);
});

test('throws with invalid arguments', () => {
  expect(() => (listen as any)(KIND_A, true, false, false)).toThrow();
});
