import { State, Expect, Store } from '@memento/probe';
import createHotline, {
  connect,
  disconnect,
  send,
  close,
  ConnectTask,
  OpenTask,
  DisconnectTask,
  LifeCycleTask,
  SendTask,
  ReceivedTask,
  KIND_CONNECT,
  KIND_OPEN,
  KIND_RECEIVED,
  KIND_DISCONNECT,
  KIND_CLOSE,
  KIND_SEND,
  open,
  received,
} from './';

const store = new Store(State.defaultState, createHotline());

beforeEach(() => {});

test('toString() ouputs the kind as string', () => {
  expect(connect.toString()).toEqual(KIND_CONNECT);
  expect(open.toString()).toEqual(KIND_OPEN);
  expect(send.toString()).toEqual(KIND_SEND);
  expect(received.toString()).toEqual(KIND_RECEIVED);
  expect(close.toString()).toEqual(KIND_CLOSE);
  expect(disconnect.toString()).toEqual(KIND_DISCONNECT);
});

test('triggers the connected task on connection', async () => {
  await store.run(
    connect('ws://echo.websocket.org'),
    new Expect.TaskAssignment<State, ConnectTask>({
      kind: KIND_CONNECT,
      payload: {
        name: 'default',
        tags: [],
        url: 'ws://echo.websocket.org',
      },
    }),
    new Expect.TaskAssignment<State, OpenTask>({
      kind: KIND_OPEN,
      payload: {
        name: 'default',
        tags: [],
      },
    }),
  );
});

test('triggers the message task on incoming messages', async () => {
  await store.run(
    send({ greeting: 'Hello Memento!' }),
    new Expect.TaskAssignment<State, SendTask>({
      kind: KIND_SEND,
      payload: {
        name: 'default',
        message: {
          greeting: 'Hello Memento!',
        },
      },
    }),
    new Expect.TaskAssignment<State, ReceivedTask>({
      kind: KIND_RECEIVED,
      payload: {
        name: 'default',
        tags: [],
        data: {
          greeting: 'Hello Memento!',
        },
      },
    }),
  );
});

test('triggers the close task on disconnect', async () => {
  await store.run(
    disconnect('default'),
    new Expect.TaskAssignment<State, DisconnectTask>({
      kind: KIND_DISCONNECT,
      payload: 'default',
    }),
    new Expect.TaskAssignment<State, LifeCycleTask>({
      kind: KIND_CLOSE,
      payload: {
        name: 'default',
        tags: [],
      },
    }),
  );
});

test('works with multiple connections', async () => {
  store.reset();

  await store.run(
    connect({ url: 'ws://echo.websocket.org' }),
    new Expect.TaskAssignment<State, ConnectTask>({
      kind: KIND_CONNECT,
      payload: {
        name: 'default',
        tags: [],
        url: 'ws://echo.websocket.org',
      },
    }),
    new Expect.TaskAssignment<State, OpenTask>({
      kind: KIND_OPEN,
      payload: {
        name: 'default',
        tags: [],
      },
    }),
  );

  await store.run(
    connect({ name: 'socket2', url: 'ws://echo.websocket.org' }),
    new Expect.TaskAssignment<State, ConnectTask>({
      kind: KIND_CONNECT,
      payload: {
        name: 'socket2',
        tags: [],
        url: 'ws://echo.websocket.org',
      },
    }),
    new Expect.TaskAssignment<State, OpenTask>({
      kind: KIND_OPEN,
      payload: {
        name: 'socket2',
        tags: [],
      },
    }),
  );

  await store.run(
    send({ greeting: 'Hello Memento 1!' }),
    new Expect.TaskAssignment<State, SendTask>({
      kind: KIND_SEND,
      payload: {
        name: 'default',
        message: {
          greeting: 'Hello Memento 1!',
        },
      },
    }),
    new Expect.TaskAssignment<State, ReceivedTask>({
      kind: KIND_RECEIVED,
      payload: {
        name: 'default',
        tags: [],
        data: {
          greeting: 'Hello Memento 1!',
        },
      },
    }),
  );

  await store.run(
    send('socket2', { greeting: 'Hello Memento 2!' }),
    new Expect.TaskAssignment<State, SendTask>({
      kind: KIND_SEND,
      payload: {
        name: 'socket2',
        message: {
          greeting: 'Hello Memento 2!',
        },
      },
    }),
    new Expect.TaskAssignment<State, ReceivedTask>({
      kind: KIND_RECEIVED,
      payload: {
        name: 'socket2',
        tags: [],
        data: {
          greeting: 'Hello Memento 2!',
        },
      },
    }),
  );

  await store.run(
    disconnect(),
    new Expect.TaskAssignment<State, DisconnectTask>({
      kind: KIND_DISCONNECT,
      payload: 'default',
    }),
    new Expect.TaskAssignment<State, LifeCycleTask>({
      kind: KIND_CLOSE,
      payload: {
        name: 'default',
        tags: [],
      },
    }),
  );

  await store.run(
    disconnect('socket2'),
    new Expect.TaskAssignment<State, DisconnectTask>({
      kind: KIND_DISCONNECT,
      payload: 'socket2',
    }),
    new Expect.TaskAssignment<State, LifeCycleTask>({
      kind: KIND_CLOSE,
      payload: {
        name: 'socket2',
        tags: [],
      },
    }),
  );
});