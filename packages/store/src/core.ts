import { Observable } from '@reactivex/rxjs';
import { Record } from 'immutable';

export type Diff<T extends string, U extends string> = ({ [P in T]: P } &
  { [P in U]: never } & { [x: string]: never })[T];

export type Omit<T, K extends keyof T> = Pick<T, Diff<keyof T, K>>;

export interface State<TStateProps = any> extends Record<TStateProps> {}

export interface Updater<TState extends State> {
  (state: TState): TState;
}

export interface Listener<TState extends State> {
  (prevState: TState, nextState: TState): void;
}

export interface Selector<TState extends State, TOutput = any> {
  (state: TState): TOutput;
}

export interface Task<TKind extends string = string, TPayload = any> {
  kind: TKind;
  payload: TPayload;
}

export interface TaskObservable extends Observable<Task> {
  accept<TTask extends Task>(kind: TTask['kind']): Observable<TTask>;
}

export interface StateObservable<TState extends State> extends Observable<TState> {
  select<T = any>(selector: Selector<TState, T>): Observable<T>;
}

export interface Worker<TState extends State> {
  (task$: TaskObservable, state$: StateObservable<TState>): Observable<Updater<TState> | Task>;
}
