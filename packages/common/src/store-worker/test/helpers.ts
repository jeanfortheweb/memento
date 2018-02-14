import { TaskSubject, Updater, Worker, State, Task } from '@memento/store';
import { Subject } from '@reactivex/rxjs';
import { Record, List } from 'immutable';

export interface InnerTestProps {
  a: number;
  b: number;
}

export interface TestProps {
  a: string;
  b: number;
  child: InnerTestProps;
  list: List<InnerTestProps>;
}

export class TestState extends Record<TestProps>({
  a: '',
  b: 0,
  child: {
    a: 0,
    b: 0,
  },
  list: List([{ a: 0, b: 0 }]),
}) {}

export const wire = <TState extends State>(worker: Worker<TState>, state: TState) => {
  const taskSubject = new TaskSubject<TState>();
  const updaterSubject = new Subject<Updater<TState>>();

  worker(taskSubject, null as any).subscribe(updaterSubject);

  return (task: Task<TState>, before: any, after: any) =>
    new Promise(resolve => {
      expect(state.toJS()).toMatchObject(before);

      const subscription = updaterSubject.subscribe(updater => {
        expect(updater(state).toJS()).toMatchObject(after);
        subscription.unsubscribe();
        resolve();
      });

      taskSubject.next(task);
    });
};
