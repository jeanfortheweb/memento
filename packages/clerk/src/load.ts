import {
  State,
  Worker,
  Task,
  TaskObservable,
  StateObservable,
  Updater,
} from '@memento/store';
import { Observable } from '@reactivex/rxjs';
import { Configuration, Target, LoadMode } from './configuration';
import { pathToArray, getStorageKey } from './utils';
import { fromJS } from 'immutable';

export const KIND = '@CLERK/LOAD';

export type LoadTask = Task<typeof KIND, string>;

const createLoader = (configuration: Configuration) => () => {
  const { path, name, target, empty, reviver } = configuration;
  const storage = target === Target.Local ? localStorage : sessionStorage;
  const key = getStorageKey(name);

  let data = JSON.parse(storage.getItem(key) as string);

  if (data === null && empty) {
    return empty();
  }

  return state => state.setIn(pathToArray(path), fromJS(data, reviver));
};

export const accept = <TState extends State>(
  configuration: Configuration,
): Worker<TState> => (
  task$: TaskObservable & Observable<Task>,
  state$: StateObservable<TState>,
) => {
  let output$: Observable<Updater<TState> | Task> = task$
    .accept(load)
    .filter(task => task.payload === configuration.name)
    .map(createLoader(configuration))
    .delay(1);

  if (configuration.load === LoadMode.Auto) {
    output$ = Observable.merge(output$, Observable.of(load(configuration.name)));
  }

  return output$;
};

export const load = (name: string): LoadTask => ({
  kind: KIND,
  payload: name,
});

load.toString = () => KIND;

export default load;
