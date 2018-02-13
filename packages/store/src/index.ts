import { Observable, Subject, BehaviorSubject } from '@reactivex/rxjs';
import { Set, Record } from 'immutable';

export interface State<TStateProps = any> extends Record<TStateProps> {}

export interface Updater<TState extends State> {
  (state: TState): TState;
}

export interface Factory<TProduct, TParameters extends Object = any> {
  (parameters: TParameters): TProduct;
}

export interface UpdaterFactory<TState extends State, TParameters extends Object = any>
  extends Factory<Updater<TState>, TParameters> {}

export interface Listener<TState extends State> {
  (prevState: TState, nextState: TState): void;
}

export interface Selector<TState extends State, TOutput = any> {
  (state: TState): TOutput;
}

export interface SelectorFactory<TState extends State, TParameters extends Object = any>
  extends Factory<Selector<TState>, TParameters> {}

export interface Task<TState extends State> {
  kind: string;
  state?: TState;
}

export interface Worker<TState extends State> {
  (task$: TaskSubject<TState>, state$: StateSubject<TState>): Observable<Updater<TState>>;
}

export interface WorkerFactory<TState extends State, TParameters extends Object = any>
  extends Factory<Worker<TState>, TParameters> {}

export interface TaskObservable<TState extends State> extends Observable<Task<TState>> {
  accept<TTask extends Task<TState>>(kind: string): Observable<TTask>;
}

export class TaskSubject<TState extends State> extends Subject<Task<TState>>
  implements TaskObservable<TState> {
  public accept<TTask extends Task<TState>>(kind: string) {
    return this.filter<Task<TState>, TTask>((task): task is TTask => task.kind === kind);
  }
}

export interface StateObservable<TState extends State> extends Observable<TState> {
  select<T = any>(selector: Selector<TState, T>): Observable<T>;
}

export interface SelectorMemory<TOutput = any> {
  previous: TOutput;
  current: TOutput;
}

export class StateSubject<TState extends State> extends BehaviorSubject<TState>
  implements StateObservable<TState> {
  public select<T>(selector: Selector<TState, T>): Observable<T> {
    const memory: Observable<SelectorMemory<T>> = this.scan<TState, Partial<SelectorMemory<T>>>(
      (acc, value) => ({
        previous: acc.current,
        current: selector(value),
      }),
      {},
    ) as Observable<SelectorMemory<T>>;

    return memory
      .filter<SelectorMemory<T>>(value => value.previous !== value.current)
      .map<SelectorMemory<T>, T>(value => value.current);
  }
}

export class Store<TState extends State> implements Store<TState> {
  private _task$: TaskSubject<TState>;
  private _state$: StateSubject<TState>;
  private _updater$: Subject<Updater<TState>>;
  private _state: TState;
  private _listeners: Set<Listener<TState>>;

  constructor(initialState: TState, workers: Worker<TState>[]) {
    this._listeners = Set();
    this._state = initialState;
    this._task$ = new TaskSubject<TState>();
    this._state$ = new StateSubject<TState>(initialState);
    this._updater$ = new Subject();
    this._updater$.subscribe(updater => {
      const prevState = this._state;
      this._state = updater(prevState);

      if (prevState !== this._state) {
        this._listeners.forEach(listener => listener(prevState, this._state));
        this._state$.next(this._state);
      }
    });

    workers.map(worker => worker(this._task$, this._state$).subscribe(this._updater$));
  }

  public select<T>(selector: Selector<TState, T>): T {
    return selector(this._state);
  }

  public assign(task: Task<TState>) {
    this._task$.next(task);
  }

  public listen(listener: Listener<TState>) {
    this._listeners = this._listeners.add(listener);

    return () => {
      this._listeners = this._listeners.remove(listener);
    };
  }
}

export default Store;
