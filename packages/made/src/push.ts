import { State, Task, Updater, TaskObservable } from '@memento/store';
import { Observable } from '@reactivex/rxjs';
import { pathToArray } from './utils';

export const KIND = '@MADE/PUSH';

export type PushTask<TData> = Task<typeof KIND, { path: string; data: TData[] }>;

export const accept = <TState extends State>(task$: TaskObservable & Observable<Task>) =>
  task$.accept<PushTask<any>>(KIND).map<PushTask<any>, Updater<TState>>(task => state => {
    return state.updateIn(pathToArray(task.payload.path), target =>
      target.push(...task.payload.data),
    );
  });

const push = <TData = any>(path: string, ...data: TData[]): PushTask<TData> => ({
  kind: KIND,
  payload: {
    path,
    data,
  },
});

push.toString = () => KIND;

export default push;
