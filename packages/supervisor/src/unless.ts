import { State, Selector, Task, TaskObservable, StateObservable } from '@memento/store';
import { Observable } from '@reactivex/rxjs';

export const KIND = '@SUPERVISOR/UNLESS';

export type UnlessTask<TState extends State> = Task<
  typeof KIND,
  { predicate: Selector<TState, boolean>; creator: () => Task }
>;

export const accept = <TState extends State>(
  task$: TaskObservable & Observable<Task>,
  state$: StateObservable<TState>,
) =>
  task$.accept(unless).flatMap(task =>
    state$
      .select(state => state)
      .take(1)
      .filter(state => !task.payload.predicate(state))
      .map(() => task.payload.creator()),
  );

export const unless = <TState extends State>(
  predicate: Selector<TState, boolean>,
  creator: () => Task,
): UnlessTask<TState> => ({
  kind: KIND,
  payload: {
    predicate,
    creator,
  },
});

unless.toString = () => KIND;

export default unless;
