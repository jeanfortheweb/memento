import { State, Task, TaskObservable, StateObservable } from '@memento/store';
import { Observable } from '@reactivex/rxjs';
import { createTimerTable } from './utils';

export const KIND = '@SUPERVISOR/DEBOUNCE';

export type DebounceTask = Task<typeof KIND, { duration: number; creator: () => Task }>;

export const accept = <TState extends State>(
  task$: TaskObservable & Observable<Task>,
  state$: StateObservable<TState>,
) => {
  const getTimer = createTimerTable<DebounceTask>();

  return task$
    .accept(debounce)
    .debounce(task => getTimer(task, task.payload.duration))
    .map(task => task.payload.creator());
};

export const debounce = (duration: number, creator: () => Task): DebounceTask => ({
  kind: KIND,
  payload: {
    duration,
    creator,
  },
});

debounce.toString = () => KIND;

export default debounce;
