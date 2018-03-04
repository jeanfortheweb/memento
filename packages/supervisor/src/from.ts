import { State, Selector, Task, TaskObservable, StateObservable } from '@memento/store';
import { Observable } from '@reactivex/rxjs';

export const KIND = '@SUPERVISOR/FROM';

export type FromTask<TState extends State, TData> = Task<
  typeof KIND,
  { selector: Selector<TState, TData>; creator: (data: TData) => Task }
>;

export const accept = <TState extends State>(
  task$: TaskObservable & Observable<Task>,
  state$: StateObservable<TState>,
) =>
  task$
    .accept(from)
    .combineLatest(state$)
    .map(([task, state]) => task.payload.creator(task.payload.selector(state)));

export const from = <TState extends State, TData = any>(
  selector: Selector<TState, TData>,
  creator: (data: TData) => Task,
): FromTask<TState, TData> => ({
  kind: KIND,
  payload: {
    selector,
    creator,
  },
});

from.toString = () => KIND;

export default from;
