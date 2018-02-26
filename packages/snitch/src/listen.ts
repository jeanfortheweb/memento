import { Observable } from '@reactivex/rxjs';
import { TaskObservable, Task, TaskCreator } from '@memento/store';

export const KIND_LISTEN = '@SNITCH/LISTEN';
export const KIND_LISTEN_ONCE = '@SNITCH/LISTEN/ONCE';
export const KIND_UNLISTEN = '@SNITCH/UNLISTEN';

export interface ListenOnce {
  <TKind extends string = string, TPayload = any>(
    kind: TKind | TaskCreator<TKind, TPayload>,
    creator: CreatorFunction<TPayload>,
  ): ListenTask;

  <TKind extends string = string, TPayload = any>(
    kind: TKind | TaskCreator<TKind, TPayload>,
    predicate: PredicateFunction<TPayload>,
    creator: CreatorFunction<TPayload>,
  ): ListenTask;
}

export interface Listen extends ListenOnce {
  <TKind extends string = string, TPayload = any>(
    name: string,
    kind: TKind | TaskCreator<TKind, TPayload>,
    creator: CreatorFunction<TPayload>,
  ): ListenTask;

  <TKind extends string = string, TPayload = any>(
    name: string,
    kind: TKind | TaskCreator<TKind, TPayload>,
    predicate: PredicateFunction<TPayload>,
    creator: CreatorFunction<TPayload>,
  ): ListenTask;

  once: ListenOnce;
}

export type ListenTask = Task<
  typeof KIND_LISTEN,
  {
    name?: string;
    kind: string;
    predicate?: PredicateFunction<any>;
    assign: CreatorFunction<any>;
  }
>;

export type ListenOnceTask = Task<
  typeof KIND_LISTEN_ONCE,
  {
    kind: string;
    predicate?: PredicateFunction<any>;
    assign: CreatorFunction<any>;
  }
>;

export type UnListenTask = Task<typeof KIND_UNLISTEN, string>;

export interface CreatorFunction<TPayload> {
  (payload: TPayload): Task;
}

export interface PredicateFunction<TPayload> {
  (payload: TPayload): boolean;
}

const noFilter = () => true;

const mapToAssign = (
  task$: TaskObservable,
  { payload: { kind, predicate, assign } }: ListenTask | ListenOnceTask,
) =>
  task$
    .accept(kind)
    .filter(task => (predicate ? predicate(task.payload) : noFilter()))
    .map(task => assign(task.payload));

export const accept = (task$: TaskObservable & Observable<Task>): Observable<Task> =>
  Observable.merge(
    task$
      .accept(listen)
      .flatMap(task =>
        mapToAssign(task$, task).takeUntil(
          task$
            .accept(unlisten)
            .filter(unlistenTask => unlistenTask.payload === task.payload.name),
        ),
      ),
    task$.accept(listen.once).flatMap(task => mapToAssign(task$, task).take(1)),
  );

export const unlisten = (name: string): UnListenTask => ({
  kind: KIND_UNLISTEN,
  payload: name,
});

unlisten.toString = () => KIND_UNLISTEN;

const listenCreator: any = (a?, b?, c?, d?): ListenTask => {
  return {
    kind: KIND_LISTEN,
    payload: match(a.toString(), b, c, d, {
      'string|function': (kind, assign) => ({
        kind,
        assign,
      }),
      'string|string|function': (name, kind, assign) => ({
        name,
        kind,
        assign,
      }),
      'string|function|function': (kind, predicate, assign) => ({
        kind,
        predicate,
        assign,
      }),
      'string|string|function|function': (name, kind, predicate, assign) => ({
        name,
        kind,
        predicate,
        assign,
      }),
    }),
  };
};

function once(a?, b?, c?): ListenOnceTask {
  return {
    kind: KIND_LISTEN_ONCE,
    payload: match(a.toString(), b, c, {
      'string|function': (kind, assign) => ({
        kind,
        assign,
      }),
      'string|function|function': (kind, predicate, assign) => ({
        kind,
        predicate,
        assign,
      }),
    }),
  };
}

once.toString = () => KIND_LISTEN_ONCE;

listenCreator.once = once;
listenCreator.toString = () => KIND_LISTEN;

export const listen: Listen = listenCreator;

const match = (...args: any[]) => {
  const map = args.pop();
  const pattern = args
    .map(arg => typeof arg)
    .filter(arg => arg !== 'undefined')
    .join('|');

  if (map[pattern] !== undefined) {
    return map[pattern].apply(null, args);
  }

  throw new Error(`Invalid arguments, expected one of: ${Object.keys(map).join(', ')}`);
};
