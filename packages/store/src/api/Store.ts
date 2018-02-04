import { Subject } from '@reactivex/rxjs';
import { Set } from 'immutable';
import { Store, State, Worker, Task, Action, Updater, Listener } from '../core';

export default class<TState extends State> implements Store<TState> {
  private _task$: Subject<Task<any>>;
  private _action$: Subject<Action<TState>>;
  private _state: TState;
  private _listeners: Set<Listener<TState>>;

  constructor(initialState: TState, workers: Worker<TState, any>[] = []) {
    this._listeners = Set();
    this._state = initialState;
    this._task$ = new Subject();
    this._action$ = new Subject();
    this._action$.subscribe(action => action.dispatch(this));

    workers.map(worker =>
      worker
        .setup(this._task$.filter<Task<TState>>(task => task instanceof worker.for()))
        .subscribe(this._action$),
    );
  }

  public assign(task: Task<TState>) {
    this._task$.next(task);
  }

  public update(updater: Updater<TState>) {
    const prevState = this._state;
    this._state = updater(prevState);

    if (prevState !== this._state) {
      this._listeners.forEach(listener => listener(prevState, this._state));
    }
  }

  public listen(listener: Listener<TState>) {
    this._listeners = this._listeners.add(listener);

    return () => {
      this._listeners = this._listeners.remove(listener);
    };
  }
}
