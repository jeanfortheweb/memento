import { State, Task, Updater, TaskObservable } from '@memento/store';
import { Observable } from '@reactivex/rxjs';
import { List, merge } from 'immutable';
import { pathToArray } from './utils';

export const KIND = '@MADE/UPDATE';

export type UpdateTask<TData> = Task<
  typeof KIND,
  { path: string; element: TData; data: Partial<TData> }
>;

export const accept = <TState extends State>(task$: TaskObservable & Observable<Task>) =>
  task$
    .accept(update)
    .map<UpdateTask<any>, Updater<TState>>(task => state =>
      state.updateIn(pathToArray(task.payload.path), (target: List<any>) =>
        target.update(target.indexOf(task.payload.element), element =>
          merge(element, task.payload.data),
        ),
      ),
    );

const update = <TData = any>(
  path: string,
  element: TData,
  data: Partial<TData>,
): UpdateTask<TData> => ({
  kind: KIND,
  payload: {
    path,
    element,
    data,
  },
});

update.toString = () => KIND;

export default update;
