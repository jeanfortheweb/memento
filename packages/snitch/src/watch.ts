import { Observable } from '@reactivex/rxjs';
import { TaskObservable, Task, Selector, State, StateObservable } from '@memento/store';

export const KIND_WATCH = '@SNITCH/WATCH';
export const KIND_WATCH_ONCE = '@SNITCH/WATCH/ONCE';
export const KIND_UNWATCH = '@SNITCH/UNWATCH';

export type WatchTask<TState extends State, TData> = Task<
  typeof KIND_WATCH,
  {
    name?: string;
    selector: Selector<TState, TData>;
    creator: CreatorFunction<any>;
  }
>;

export type WatchOnceTask<TState extends State, TData> = Task<
  typeof KIND_WATCH_ONCE,
  {
    selector: Selector<TState, TData>;
    creator: CreatorFunction<any>;
  }
>;

export type UnWatchTask = Task<typeof KIND_UNWATCH, string>;

export interface CreatorFunction<TPayload> {
  (payload: TPayload): Task;
}

export interface PredicateFunction<TPayload> {
  (payload: TPayload): boolean;
}

export const accept = <TState extends State>(
  task$: TaskObservable & Observable<Task>,
  state$: StateObservable<TState>,
): Observable<Task> =>
  Observable.merge(
    task$.accept(watch).flatMap(({ payload: { name, selector, creator } }) =>
      state$
        .select(selector)
        .map(data => creator(data))
        .takeUntil(task$.accept(unwatch).filter(task => task.payload === name)),
    ),
    task$.accept(watch.once).flatMap(({ payload: { selector, creator } }) =>
      state$
        .select(selector)
        .map(data => creator(data))
        .take(1),
    ),
  );

export const unwatch = (name: string): UnWatchTask => ({
  kind: KIND_UNWATCH,
  payload: name,
});

unwatch.toString = () => KIND_UNWATCH;

export function watch<TState extends State, TData = any>(
  name: string,
  selector: Selector<TState, TData>,
  creator: CreatorFunction<TData>,
): WatchTask<TState, TData> {
  return {
    kind: KIND_WATCH,
    payload: {
      name,
      selector,
      creator,
    },
  };
}

watch.toString = () => KIND_WATCH;

// istanbul ignore next
export namespace watch {
  export function once<TState extends State, TData = any>(
    selector: Selector<TState, TData>,
    creator: CreatorFunction<TData>,
  ): WatchOnceTask<TState, TData> {
    return {
      kind: KIND_WATCH_ONCE,
      payload: {
        selector,
        creator,
      },
    };
  }

  once.toString = () => KIND_WATCH_ONCE;
}
