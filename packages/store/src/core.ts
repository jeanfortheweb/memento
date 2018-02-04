import { Record } from 'immutable';
import { Observable } from '@reactivex/rxjs';

export interface Class<T> {
  new (): T;
}

export interface State<TStateProps = any> extends Record<TStateProps> {}

export interface Updater<TState extends State> {
  (state: TState): TState;
}

export interface Listener<TState extends State> {
  (prevState: TState, nextState: TState): void;
}

export interface Task<TState extends State, TParameters extends Object = any> {
  readonly state?: TState;
  readonly parameters?: TParameters;
}

export interface Action<TState extends State> {
  dispatch(store: Store<TState>);
}

export interface Worker<TState extends State, TTask extends Task<TState>> {
  for(): Class<TTask>;
  setup(task$: Observable<TTask>): Observable<Action<TState>>;
}

export interface Store<TState extends State> {
  assign(task: Task<TState>): void;
  update(updater: Updater<TState>): void;
  listen(listener: Listener<TState>): () => void;
}
