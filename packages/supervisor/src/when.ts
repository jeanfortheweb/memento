import { State, Selector, Task, TaskObservable, StateObservable } from '@memento/store';
import { Observable } from '@reactivex/rxjs';

export const KIND = '@SUPERVISOR/WHEN';

export type WhenTask<TState extends State> = Task<
  typeof KIND,
  { predicate: Selector<TState, boolean>; creator: () => Task }
>;

export const accept = <TState extends State>(
  task$: TaskObservable & Observable<Task>,
  state$: StateObservable<TState>,
) =>
  task$
    .accept(when)
    .combineLatest(state$)
    .filter(([task, state]) => task.payload.predicate(state))
    .map(([task]) => task.payload.creator());

export const when = <TState extends State>(
  predicate: Selector<TState, boolean>,
  creator: () => Task,
): WhenTask<TState> => ({
  kind: KIND,
  payload: {
    predicate,
    creator,
  },
});

when.toString = () => KIND;

export default when;
