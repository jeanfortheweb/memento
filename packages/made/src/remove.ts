import { State, Task, Updater, TaskObservable } from '@memento/store';
import { List } from 'immutable';
import { Observable } from '@reactivex/rxjs';
import { pathToArray } from './utils';

export const KIND = '@MADE/REMOVE';

export type RemoveTask<TData> = Task<typeof KIND, { path: string; data: TData[] }>;

export const accept = <TState extends State>(task$: TaskObservable & Observable<Task>) =>
  task$.accept<RemoveTask<any>>(KIND).map<RemoveTask<any>, Updater<TState>>(task => state => {
    return state.updateIn(pathToArray(task.payload.path), (target: List<any>) =>
      task.payload.data.reduce<List<any>>(
        (newTarget, item) => newTarget.remove(newTarget.indexOf(item)),
        target,
      ),
    );
  });

const remove = <TData = any>(path: string, ...data: TData[]): RemoveTask<TData> => ({
  kind: KIND,
  payload: {
    path,
    data,
  },
});

remove.toString = () => KIND;

export default remove;
