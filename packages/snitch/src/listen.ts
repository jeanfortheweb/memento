import { Observable } from '@reactivex/rxjs';
import { TaskObservable, Task } from '@memento/store';

export const KIND_LISTEN = '@SNITCH/LISTEN';
export const KIND_UNLISTEN = '@SNITCH/UNLISTEN';

export type ListenTask = Task<
  typeof KIND_LISTEN,
  {
    name?: string;
    kind: string;
    predicate?: PredicateFunction<any>;
    assign: AssignFunction<any>;
  }
>;

export type UnListenTask = Task<typeof KIND_UNLISTEN, string>;

export interface AssignFunction<TTask extends Task> {
  (payload: TTask['payload']): Task;
}

export interface PredicateFunction<TTask extends Task> {
  (payload: TTask['payload']): boolean;
}

const noFilter = () => true;

export const accept = (task$: TaskObservable & Observable<Task>): Observable<Task> =>
  task$.accept<ListenTask>(KIND_LISTEN).flatMap(({ payload: { name, kind, predicate, assign } }) =>
    task$
      .accept(kind)
      .filter(task => (predicate ? predicate(task.payload) : noFilter()))
      .map(task => assign(task.payload))
      .takeUntil(
        task$
          .accept<UnListenTask>(KIND_UNLISTEN)
          .filter(unlistenTask => unlistenTask.payload === name),
      ),
  );

export const unlisten = (name: string): UnListenTask => ({
  kind: KIND_UNLISTEN,
  payload: name,
});

unlisten.toString = () => KIND_UNLISTEN;

export function listen<TTask extends Task>(kind: string, assign: AssignFunction<TTask>): ListenTask;

export function listen<TTask extends Task>(
  name: string,
  kind: string,
  assign: AssignFunction<TTask>,
): ListenTask;

export function listen<TTask extends Task>(
  kind: string,
  predicate: PredicateFunction<TTask>,
  assign: AssignFunction<TTask>,
): ListenTask;

export function listen<TTask extends Task>(
  name: string,
  kind: string,
  predicate: PredicateFunction<TTask>,
  assign: AssignFunction<TTask>,
): ListenTask;

export function listen(a?, b?, c?, d?) {
  return {
    kind: KIND_LISTEN,
    payload: match(a, b, c, d, {
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
}

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

listen.toString = () => KIND_LISTEN;
