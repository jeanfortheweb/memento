import sequence, { accept, KIND } from './sequence';
import { TaskSubject, Task, Updater } from '@memento/store';
import { Subject } from '@reactivex/rxjs';
import { Record } from 'immutable';

class State extends Record({}) {}
const tasks = [{ kind: 'A', payload: null }, { kind: 'B', payload: null }];

test('creates the expected task object', () => {
  expect(sequence(...tasks)).toMatchObject({
    kind: KIND,
    payload: tasks,
  });

  expect(sequence.toString()).toEqual(KIND);
});

test('does forward all given tasks', () => {
  const taskSubject = new TaskSubject();
  const updaterSubject = new Subject<Updater<State> | Task>();
  const subscriber = jest.fn();

  accept(taskSubject).subscribe(updaterSubject);

  updaterSubject.subscribe(subscriber);

  taskSubject.next(sequence(...tasks));

  expect(subscriber).toHaveBeenCalledTimes(2);
  expect(subscriber.mock.calls).toMatchObject([[tasks[0]], [tasks[1]]]);
});
