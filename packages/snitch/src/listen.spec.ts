import { TaskSubject } from '@memento/store';
import listen, { accept, KIND, Target } from './listen';

const KIND_A = '@TEST/KIND_A';

const run = (target: Function | string | Partial<Target<any>>) => {
  const task$ = new TaskSubject();
  const assign = jest.fn();

  accept(task$).subscribe();

  if (typeof target === 'object') {
    target.kind = KIND_A;
  }

  task$.next(listen(target as any, assign));
  task$.next({
    kind: KIND_A,
    payload: {
      a: true,
      b: 'foo',
    },
  });

  return assign;
};

test('creates the expected task object', () => {
  const assign = jest.fn();

  expect(listen(KIND_A, assign)).toMatchObject({
    kind: KIND,
    payload: {
      target: KIND_A,
      assign,
    },
  });

  expect(listen.toString()).toEqual(KIND);
});

test('does invoke assign function on string targets', () => {
  expect(run(KIND_A)).toHaveBeenCalledTimes(1);
});

test('does invoke assign function on function targets', () => {
  const taskCreator = () => ({});
  taskCreator.toString = () => KIND_A;

  expect(run(taskCreator)).toHaveBeenCalledTimes(1);
});

test('does invoke assign with payload filter object matching', () => {
  expect(
    run({
      payload: {
        b: 'foo',
      },
    }),
  ).toHaveBeenCalledTimes(1);
});

test('does not invoke assign with payload filter object not matching', () => {
  expect(
    run({
      payload: {
        b: 'bar',
      },
    }),
  ).toHaveBeenCalledTimes(0);
});

test('does invoke assign with payload filter function returning true', () => {
  expect(
    run({
      predicate: payload => payload.a === true,
    }),
  ).toHaveBeenCalledTimes(1);
});

test('does not invoke assign with payload filter function returning false', () => {
  expect(
    run({
      predicate: payload => payload.b === 'bar',
    }),
  ).toHaveBeenCalledTimes(0);
});
