import { State, Task, Updater, TaskObservable } from '@memento/store';
import { Observable } from '@reactivex/rxjs';

export const KIND = '@MADE/MERGE';

export type MergeTask<TData> = Task<typeof KIND, Partial<TData>>;

export const accept = <TState extends State>(task$: TaskObservable & Observable<Task>) =>
  task$.accept<MergeTask<any>>(KIND).map<MergeTask<any>, Updater<TState>>(task => state => {
    return state.merge(task.payload);
  });

export const merge = <TData = any>(data: Partial<TData>): MergeTask<TData> => ({
  kind: KIND,
  payload: data,
});

merge.toString = () => KIND;

export default merge;
