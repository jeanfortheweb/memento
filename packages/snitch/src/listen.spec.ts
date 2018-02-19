import { TaskSubject } from '@memento/store';
import { listen, accept, KIND_LISTEN, unlisten, KIND_UNLISTEN, KIND_LISTEN_ONCE } from './listen';

const KIND_A = '@TEST/KIND_A';

const run = (...args: any[]) => {
  const task$ = new TaskSubject();
  const assign = jest.fn();

  accept(task$).subscribe();

  task$.next(listen.apply(null, [...args, assign]));
  task$.next({
    kind: KIND_A,
    payload: {
      a: true,
      b: 'foo',
    },
  });

  return assign;
};

test('creates the expected task objects', () => {
  const assign = jest.fn();

  expect(listen(KIND_A, assign)).toMatchObject({
    kind: KIND_LISTEN,
    payload: {
      kind: KIND_A,
      assign,
    },
  });

  expect(listen.toString()).toEqual(KIND_LISTEN);

  expect(listen.once(KIND_A, assign)).toMatchObject({
    kind: KIND_LISTEN_ONCE,
    payload: {
      kind: KIND_A,
      assign,
    },
  });

  expect(listen.once.toString()).toEqual(KIND_LISTEN_ONCE);

  expect(unlisten('foo')).toMatchObject({
    kind: KIND_UNLISTEN,
    payload: 'foo',
  });

  expect(unlisten.toString()).toEqual(KIND_UNLISTEN);
});

test('does invoke assign function on string targets', () => {
  expect(run(KIND_A)).toHaveBeenCalledTimes(1);
});

test('does invoke assign function on function targets', () => {
  const taskCreator = () => ({});
  taskCreator.toString = () => KIND_A;

  expect(run(taskCreator.toString())).toHaveBeenCalledTimes(1);
});

test('does invoke assign with payload filter function returning true', () => {
  expect(run(KIND_A, payload => payload.a === true)).toHaveBeenCalledTimes(1);
});

test('does not invoke assign with payload filter function returning false', () => {
  expect(run(KIND_A, payload => payload.b === 'bar')).toHaveBeenCalledTimes(0);
});

test('does stop listening when unlisten is emitted', () => {
  const task$ = new TaskSubject();
  const assign1 = jest.fn();
  const assign2 = jest.fn();
  const assign3 = jest.fn();
  const task = {
    kind: KIND_A,
    payload: {
      a: true,
      b: 'foo',
    },
  };

  accept(task$).subscribe();

  task$.next(listen('foo', KIND_A, assign1));
  task$.next(listen(KIND_A, assign2));
  task$.next(listen('foo', KIND_A, payload => payload.a, assign3));

  task$.next(task);
  task$.next(unlisten('foo'));
  task$.next(task);

  expect(assign1).toHaveBeenCalledTimes(1);
  expect(assign2).toHaveBeenCalledTimes(2);
  expect(assign3).toHaveBeenCalledTimes(1);
});

test('does stop listening with once', () => {
  const task$ = new TaskSubject();
  const assign1 = jest.fn();
  const assign2 = jest.fn();
  const task = {
    kind: KIND_A,
    payload: {
      a: true,
      b: 'foo',
    },
  };

  accept(task$).subscribe();

  task$.next(listen.once(KIND_A, assign1));
  task$.next(listen.once(KIND_A, payload => payload.a, assign2));
  task$.next(task);
  task$.next(task);

  expect(assign1).toHaveBeenCalledTimes(1);
  expect(assign2).toHaveBeenCalledTimes(1);
});

test('throws with invalid arguments', () => {
  expect(() => run(KIND_A, true, false, false)).toThrow();
});
