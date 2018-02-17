import { Set } from 'immutable';
import { State, Task, Worker, Listener, Selector, Updater } from './core';
import { isUpdater } from './utils';
import TaskSubject from './TaskSubject';
import StateSubject from './StateSubject';

class Store<TState extends State> implements Store<TState> {
  private _task$: TaskSubject;
  private _state$: StateSubject<TState>;
  private _state: TState;
  private _listeners: Set<Listener<TState>>;

  constructor(initialState: TState, workers: Worker<TState>[]) {
    this._listeners = Set();
    this._state = initialState;
    this._task$ = new TaskSubject();
    this._state$ = new StateSubject<TState>(initialState);

    workers.map(worker =>
      worker(this._task$, this._state$).subscribe(this._workerSubscriber.bind(this)),
    );
  }

  public select<T>(selector: Selector<TState, T>): T {
    return selector(this._state);
  }

  public assign(task: Task) {
    this._task$.next(task);
  }

  public listen(listener: Listener<TState>) {
    this._listeners = this._listeners.add(listener);

    return () => {
      this._listeners = this._listeners.remove(listener);
    };
  }

  private _workerSubscriber(updaterOrTask: Updater<TState> | Task) {
    if (isUpdater(updaterOrTask)) {
      const prevState = this._state;
      this._state = updaterOrTask(prevState);

      if (prevState !== this._state) {
        this._listeners.forEach(listener => listener(prevState, this._state));
        this._state$.next(this._state);
      }
    } else {
      this._task$.next(updaterOrTask);
    }
  }
}

export default Store;
