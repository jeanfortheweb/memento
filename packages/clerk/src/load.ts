import { State, Worker, Task, TaskObservable, StateObservable } from '@memento/store';
import { Observable } from '@reactivex/rxjs';
import { Configuration, Target, LoadMode } from './configuration';
import { pathToArray, getStorageKey } from './utils';
import { fromJS } from 'immutable';

export const KIND = '@CLERK/LOAD';

export type LoadTask = Task<typeof KIND, string>;

export const accept = <TState extends State>(
  configuration: Configuration,
): Worker<TState> => (
  task$: TaskObservable & Observable<Task>,
  state$: StateObservable<TState>,
) => {
  const { path, name, target, reviver } = configuration;
  const key = getStorageKey(name);
  const storage = target === Target.Local ? localStorage : sessionStorage;

  let output$: Observable<any>;

  switch (configuration.load) {
    case LoadMode.Auto:
      output$ = Observable.of(load(name));
      break;

    case LoadMode.Manual:
    default:
      output$ = task$.accept(load).filter(task => task.payload === configuration.name);
      break;
  }

  return output$.mapTo(state =>
    state.setIn(
      pathToArray(path),
      fromJS(JSON.parse(storage.getItem(key) as string), reviver),
    ),
  );
};

export const load = (name: string): LoadTask => ({
  kind: KIND,
  payload: name,
});

load.toString = () => KIND;

export default load;
