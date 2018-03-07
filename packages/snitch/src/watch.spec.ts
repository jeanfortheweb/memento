import { Store, State, Expect } from '@memento/probe';
import {
  accept,
  watch,
  unwatch,
  KIND_WATCH,
  KIND_UNWATCH,
  KIND_WATCH_ONCE,
  WatchTask,
  WatchOnceTask,
} from './watch';

const state = State.defaultState;
const store = new Store(state, accept);
const name = 'watcher';
const selector = jest.fn(state => state.host);
const creator = jest.fn(host => ({ kind: 'WATCHED', payload: host }));

beforeEach(() => {
  store.reset();
  creator.mockClear();
  selector.mockClear();
});

test('toString() outputs the kind as string', () => {
  expect(watch.toString()).toEqual(KIND_WATCH);
  expect(watch.once.toString()).toEqual(KIND_WATCH_ONCE);
  expect(unwatch.toString()).toEqual(KIND_UNWATCH);
});

test('does invoke creator function initially', async () => {
  await store.assign(
    watch(name, selector, creator),
    new Expect.TaskAssignment<State, WatchTask<State, string>>({
      kind: KIND_WATCH,
      payload: {
        name,
        selector,
        creator,
      },
    }),
  );

  expect(selector).toBeCalledWith(state);
  expect(creator).toBeCalledWith(state.host);
});

test('does invoke creator function on selector changes', async () => {
  const nextState1 = state.set('host', 'foo');
  const nextState2 = state.set('host', 'bar');

  await store.assign(
    watch(name, selector, creator),
    new Expect.TaskAssignment<State, WatchTask<State, string>>({
      kind: KIND_WATCH,
      payload: {
        name,
        selector,
        creator,
      },
    }),
    new Expect.TaskAssignment({
      kind: 'WATCHED',
      payload: state.host,
    }),
  );

  expect(selector).toHaveBeenCalledWith(state);
  expect(creator).toBeCalledWith(state.host);

  await store.update(
    () => nextState1,
    new Expect.StateChange(state, nextState1),
    new Expect.TaskAssignment({
      kind: 'WATCHED',
      payload: nextState1.host,
    }),
  );

  expect(selector).toHaveBeenCalledWith(state);
  expect(creator).toBeCalledWith('foo');

  await store.update(
    () => nextState2,
    new Expect.StateChange(nextState1, nextState2),
    new Expect.TaskAssignment({
      kind: 'WATCHED',
      payload: nextState2.host,
    }),
  );

  expect(selector).toHaveBeenCalledWith(nextState2);
  expect(creator).toBeCalledWith('bar');
});

test('does stop invoking creator function when unwatch is emitted', async () => {
  await store.assign(
    watch(name, selector, creator),
    new Expect.TaskAssignment<State, WatchTask<State, string>>({
      kind: KIND_WATCH,
      payload: {
        name,
        selector,
        creator,
      },
    }),
  );

  expect(selector).toHaveBeenCalledWith(state);
  expect(creator).toBeCalledWith(state.host);

  await store.assign(unwatch(name));
  await store.update(state => state.set('host', 'foo'));

  expect(selector).toHaveBeenCalledTimes(1);
  expect(creator).toHaveBeenCalledTimes(1);
});

test('does invoke creator function once', async () => {
  await store.assign(
    watch.once(selector, creator),
    new Expect.TaskAssignment<State, WatchOnceTask<State, string>>({
      kind: KIND_WATCH_ONCE,
      payload: {
        selector,
        creator,
      },
    }),
    new Expect.TaskAssignment({
      kind: 'WATCHED',
      payload: state.host,
    }),
  );

  expect(selector).toHaveBeenCalledTimes(1);
  expect(creator).toHaveBeenCalledTimes(1);
});
