import { State, Expect, Store } from '@memento/probe';
import {
  accept,
  start,
  stop,
  KIND_START,
  KIND_STOP,
  StartTimerTask,
  StopTimerTask,
} from './timer';
import { Task } from '@memento/store';

const defaultState = State.defaultState;
const store = new Store(defaultState, accept);

beforeEach(() => {
  store.reset();
});

test('toString() ouputs the kind as string', () => {
  expect(start.toString()).toEqual(KIND_START);
  expect(stop.toString()).toEqual(KIND_STOP);
});

test('assigns task in specified periods', async () => {
  const name: string = 'test';
  const period: number = 100;
  const creator = jest.fn((tick, period, total): Task => ({
    kind: 'TICK',
    payload: { tick, period, total },
  }));

  await store.run(
    start(name, period, creator),
    new Expect.TaskAssignment<State, StartTimerTask>({
      kind: KIND_START,
      payload: {
        name,
        initialDelay: undefined,
        period,
        creator,
      },
    }),
    new Expect.TaskAssignment({
      kind: 'TICK',
      payload: {
        tick: 0,
        period: 100,
        total: 0,
      },
    }),
    new Expect.TaskAssignment({
      kind: 'TICK',
      payload: {
        tick: 1,
        period: 100,
        total: 100,
      },
    }),
    new Expect.TaskAssignment({
      kind: 'TICK',
      payload: {
        tick: 2,
        period: 100,
        total: 200,
      },
    }),
  );

  store.run(stop(name));

  expect(creator).toHaveBeenCalledTimes(3);
  expect(store.history.task.size).toEqual(5);
});

test('assigns task in specified periods after initial delay', async () => {
  const name: string = 'test';
  const period: number = 100;
  const initialDelay: number = 200;
  const creator = jest.fn((tick, period, total): Task => ({
    kind: 'TICK',
    payload: { tick, period, total },
  }));

  await store.run(
    start(name, initialDelay, period, creator),
    new Expect.TaskAssignment<State, StartTimerTask>({
      kind: KIND_START,
      payload: {
        name,
        initialDelay,
        period,
        creator,
      },
    }),
    new Expect.TaskAssignment({
      kind: 'TICK',
      payload: {
        tick: 0,
        period: 100,
        total: 200,
      },
    }),
    new Expect.TaskAssignment({
      kind: 'TICK',
      payload: {
        tick: 1,
        period: 100,
        total: 300,
      },
    }),
    new Expect.TaskAssignment({
      kind: 'TICK',
      payload: {
        tick: 2,
        period: 100,
        total: 400,
      },
    }),
  );

  store.run(stop(name));

  expect(creator).toHaveBeenCalledTimes(3);
  expect(store.history.task.size).toEqual(5);
});
