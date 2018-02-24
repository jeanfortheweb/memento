import { State, Task, Updater, TaskObservable } from '@memento/store';
import { Observable } from '@reactivex/rxjs';
import { pathToArray } from './utils';

export const KIND = '@MADE/SET';

export type SetTask<TData> = Task<typeof KIND, { path: string; data: Partial<TData> }>;

export const accept = <TState extends State>(task$: TaskObservable & Observable<Task>) =>
  task$.accept(set).map<SetTask<any>, Updater<TState>>(task => state => {
    return state.setIn(pathToArray(task.payload.path), task.payload.data);
  });

const set = <TData = any>(path: string, data: Partial<TData>): SetTask<TData> => ({
  kind: KIND,
  payload: {
    path,
    data,
  },
});

set.toString = () => KIND;

export default set;
