import { State, Task, TaskObservable, StateObservable } from '@memento/store';
import { Observable } from '@reactivex/rxjs';
import { createTimerTable } from './utils';

export const KIND = '@SUPERVISOR/THROTTLE';

export type ThrottleTask = Task<typeof KIND, { duration: number; creator: () => Task }>;

export const accept = <TState extends State>(
  task$: TaskObservable & Observable<Task>,
  state$: StateObservable<TState>,
) => {
  const getTimer = createTimerTable<ThrottleTask>();

  return task$
    .accept(throttle)
    .throttle(task => getTimer(task, task.payload.duration))
    .map(task => task.payload.creator());
};

export const throttle = (duration: number, creator: () => Task): ThrottleTask => ({
  kind: KIND,
  payload: {
    duration,
    creator,
  },
});

throttle.toString = () => KIND;

export default throttle;