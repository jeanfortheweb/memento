import sequence, { accept } from './sequence';
import { TaskSubject, Task, Updater } from '@memento/store';
import { Subject } from '@reactivex/rxjs';
import { Record } from 'immutable';

class State extends Record({}) {}

test('sequence creates the expected task object', () => {
  expect(
    sequence<State>({
      tasks: [{ kind: 'A' }, { kind: 'B' }],
    }),
  ).toMatchObject({
    kind: '@SEQUENCE_WORKER/SEQUENCE',
    tasks: [{ kind: 'A' }, { kind: 'B' }],
  });
});

test('sequence does forward all given tasks', () => {
  const taskSubject = new TaskSubject<State>();
  const updaterSubject = new Subject<Updater<State> | Task<State>>();
  const subscriber = jest.fn();

  accept(taskSubject).subscribe(updaterSubject);

  updaterSubject.subscribe(subscriber);

  taskSubject.next(
    sequence<State>({
      tasks: [{ kind: 'A' }, { kind: 'B' }],
    }),
  );

  expect(subscriber).toHaveBeenCalledTimes(2);
  expect(subscriber.mock.calls).toMatchObject([[{ kind: 'A' }], [{ kind: 'B' }]]);
});
