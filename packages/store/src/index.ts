import { Observable, Subject } from '@reactivex/rxjs';
import { Set, Record } from 'immutable';

export interface State<TStateProps = any> extends Record<TStateProps> {}

export interface Updater<TState extends State> {
  (state: TState): TState;
}

export interface Listener<TState extends State> {
  (prevState: TState, nextState: TState): void;
}

export interface Task<TState extends State> {
  kind: string;
  state?: TState;
}

export interface TaskObservable<TState extends State> extends Observable<Task<TState>> {
  accept<TTask extends Task<TState>>(kind: string): Observable<TTask>;
}

export interface Worker<TState extends State> {
  (task$: TaskSubject<TState>): Observable<Updater<TState>>;
}

export class TaskSubject<TState extends State> extends Subject<Task<TState>>
  implements TaskObservable<TState> {
  public accept<TTask extends Task<TState>>(kind: string) {
    return this.filter<Task<TState>, TTask>((task): task is TTask => task.kind === kind);
  }
}

export class Store<TState extends State> implements Store<TState> {
  private _task$: TaskSubject<TState>;
  private _updater$: Subject<Updater<TState>>;
  private _state: TState;
  private _listeners: Set<Listener<TState>>;

  constructor(initialState: TState, workers: Worker<TState>[]) {
    this._listeners = Set();
    this._state = initialState;
    this._task$ = new TaskSubject<TState>();
    this._updater$ = new Subject();
    this._updater$.subscribe(updater => {
      const prevState = this._state;
      this._state = updater(prevState);

      if (prevState !== this._state) {
        this._listeners.forEach(listener => listener(prevState, this._state));
      }
    });

    workers.map(worker => worker(this._task$).subscribe(this._updater$));
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
