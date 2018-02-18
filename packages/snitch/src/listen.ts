import { Observable } from '@reactivex/rxjs';
import { TaskObservable, Task } from '@memento/store';

export const KIND = '@SNITCH/LISTEN';

export type ListenTask = Task<
  typeof KIND,
  {
    target: Function | string | Target<any>;
    assign: AssignFunction<any>;
  }
>;

export interface AssignFunction<TTask extends Task> {
  (task: TTask): Task;
}

export interface Target<TPayload> {
  kind: Function | string;
  payload?: Partial<TPayload>;
  predicate?: (payload: TPayload) => boolean;
}

const getTargetObservable = (task$: TaskObservable, target: Function | string | Target<any>) => {
  if (typeof target === 'function' || typeof target === 'string') {
    return task$.accept(target.toString());
  }

  return getTargetObservableFor(task$, target);
};

const getTargetObservableFor = (task$: TaskObservable, target: Target<any>) => {
  const { payload, predicate } = target;
  let target$: Observable<Task> = task$.accept(target.kind.toString());

  if (typeof predicate === 'function') {
    target$ = target$.filter(targetTask => predicate(targetTask.payload));
  }

  if (payload !== undefined) {
    target$ = target$.filter(targetTask =>
      Object.keys(payload).every(prop => targetTask.payload[prop] === payload[prop]),
    );
  }

  return target$;
};

export const accept = (task$: TaskObservable & Observable<Task>): Observable<Task> =>
  task$
    .accept<ListenTask>(KIND)
    .flatMap(task =>
      getTargetObservable(task$, task.payload.target).map(targetTask =>
        task.payload.assign(targetTask),
      ),
    );

const listen = <TTask extends Task>(
  target: Function | string | Target<TTask['payload']>,
  assign: AssignFunction<TTask>,
): ListenTask => ({
  kind: KIND,
  payload: {
    target,
    assign,
  },
});

listen.toString = () => KIND;

export default listen;
