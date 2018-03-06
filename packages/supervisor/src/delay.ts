import { State, Task, TaskObservable, StateObservable } from '@memento/store';
import { Observable } from '@reactivex/rxjs';

export const KIND = '@SUPERVISOR/DELAY';

export type DelayTask = Task<
  typeof KIND,
  { duration: number | Date; creator: () => Task }
>;

export const accept = <TState extends State>(
  task$: TaskObservable & Observable<Task>,
  state$: StateObservable<TState>,
) =>
  task$.accept(delay).mergeMap(task =>
    Observable.of(task)
      .delay(task.payload.duration)
      .map(task => task.payload.creator()),
  );

export const delay = (duration: number, creator: () => Task): DelayTask => ({
  kind: KIND,
  payload: {
    duration,
    creator,
  },
});

delay.toString = () => KIND;

export default delay;
