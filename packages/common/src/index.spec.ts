import { updateState, createStateUpdater } from './';
import { TaskSubject, State, Updater } from '@memento/store';
import { Subject } from '@reactivex/rxjs';
import { Record } from 'immutable';

interface StateProps {
  property1: string;
  property2: number;
  property3: {
    a: number;
    b: number;
  };
}

class TestState extends Record<StateProps>({
  property1: '',
  property2: 0,
  property3: {
    a: 0,
    b: 0,
  },
}) {}

test('updateState creates the expected task object', () => {
  const task = updateState<TestState, StateProps>({
    property1: 'a',
    property3: {
      a: 2,
      b: 3,
    },
  });

  expect(task).toMatchObject({
    kind: '@STATE_UPDATER/STATE_UPDATE',
    data: {
      property1: 'a',
      property3: {
        a: 2,
        b: 3,
      },
    },
  });
});

test('the update worker produces the expected output state', done => {
  const worker = createStateUpdater<TestState, StateProps>();
  const taskSubject = new TaskSubject<TestState>();
  const updaterSubject = new Subject<Updater<TestState>>();
  const state = new TestState();

  const task = updateState<TestState, StateProps>({
    property1: 'a',
    property3: {
      a: 2,
      b: 3,
    },
  });

  worker(taskSubject, null as any).subscribe(updaterSubject);

  updaterSubject.subscribe(updater => {
    expect(updater(state).toJS()).toMatchObject({
      property1: 'a',
      property2: 0,
      property3: {
        a: 2,
        b: 3,
      },
    });

    done();
  });

  taskSubject.next(task);
});
