import { Observable } from '@reactivex/rxjs';
import { TaskObservable, Task } from '@memento/store';

export const KIND_LISTEN = '@SNITCH/LISTEN';
export const KIND_UNLISTEN = '@SNITCH/UNLISTEN';

export type ListenTask = Task<
  typeof KIND_LISTEN,
  {
    target: Function | string | Target<any>;
    assign: AssignFunction<any>;
  }
>;

export type UnListenTask = Task<typeof KIND_UNLISTEN, string>;

export interface AssignFunction<TTask extends Task> {
  (task: TTask): Task;
}

export interface Target<TPayload> {
  name?: string;
  kind: Function | string;
  payload?: Partial<TPayload>;
  predicate?: (payload: TPayload) => boolean;
}

const getKind = (target: Function | string | Target<any>) => {
  if (typeof target === 'function' || typeof target === 'string') {
    return target.toString();
  }

  return target.kind.toString();
};

const getFilter = (target: Function | string | Target<any>) =>
  getPredicateFilter(target) || getPayloadFilter(target) || (() => true);

const getPredicateFilter = (target: Function | string | Target<any>) =>
  typeof target === 'object' &&
  typeof target.predicate === 'function' &&
  (task => (target.predicate as any)(task.payload));

const getPayloadFilter = (target: Function | string | Target<any>) =>
  typeof target === 'object' &&
  target.payload !== undefined &&
  (task =>
    Object.keys(target.payload as any).every(
      prop => task.payload[prop] === (target.payload as any)[prop],
    ));

const getName = (target: Function | string | Target<any>) => {
  if (typeof target !== 'function' && typeof target !== 'string') {
    return target.name;
  }

  return '';
};

export const accept = (task$: TaskObservable & Observable<Task>): Observable<Task> =>
  task$.accept<ListenTask>(KIND_LISTEN).flatMap(({ payload: { target, assign } }) =>
    task$
      .accept(getKind(target))
      .filter(getFilter(target))
      .map(targetTask => assign(targetTask))
      .takeUntil(
        task$
          .accept<UnListenTask>(KIND_UNLISTEN)
          .filter(unlistenTask => unlistenTask.payload === getName(target)),
      ),
  );

export const unlisten = (name: string): UnListenTask => ({
  kind: KIND_UNLISTEN,
  payload: name,
});

unlisten.toString = () => KIND_UNLISTEN;

export const listen = <TTask extends Task>(
  target: Function | string | Target<TTask['payload']>,
  assign: AssignFunction<TTask>,
): ListenTask => ({
  kind: KIND_LISTEN,
  payload: {
    target,
    assign,
  },
});

listen.toString = () => KIND_LISTEN;
