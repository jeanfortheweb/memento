import { Subject } from '@reactivex/rxjs';
import { Updater, State, Task, TaskSubject, StateSubject, Worker } from '@memento/store';
import HistoryState, { History } from './History';
import Expectation from './Expectation';

/**
 * `ProbeStore` implements a pattern that mimics the observable flow of an actual `Store`.
 * Each emission of its observables is stored in a history which can be used by `Expecation` implementations
 * to make assertions.
 */
export default class ProbeStore<TState extends State> {
  private _task$: TaskSubject;
  private _state$: StateSubject<TState>;
  private _output$: Subject<Task | Updater<TState>>;
  private _history: HistoryState;
  private _initialState: TState;
  private _state: TState;
  private _worker: Worker<TState>;

  /**
   * Creates a new `ProbeStore` instance.
   *
   * @param initialState The initial state.
   * @param worker The worker to use.
   */
  constructor(initialState: TState, worker: Worker<TState>) {
    this._task$ = new TaskSubject();
    this._state$ = new StateSubject<TState>(initialState);
    this._output$ = new Subject<Task | Updater<TState>>();
    this._history = new HistoryState();
    this._initialState = initialState;
    this._state = initialState;
    this._worker = worker;

    this.reset();
  }

  /**
   * Resets all internals of the store.
   */
  public reset() {
    this._task$ = new TaskSubject();
    this._state$ = new StateSubject<TState>(this._initialState);
    this._output$ = new Subject<Task | Updater<TState>>();
    this._history = new HistoryState();
    this._state = this._initialState;

    this._state$.subscribe(value => {
      this._history = this._history.update('state', state => state.push(value));
      this._state = value;
    });

    this._task$.subscribe(value => {
      this._history = this._history.update('task', task => task.push(value));
    });

    this._worker(this._task$, this._state$).subscribe(this._output$);
  }

  /**
   * Gets the current history.
   */
  public get history(): History<TState> {
    return this._history;
  }

  /**
   * Runs the given `Task` as he would run in an actual store
   * while calling the given expecations with the generating history.
   *
   * @param task The task to run.
   * @param expectations The expectations to make.
   */
  public run(task: Task, ...expectations: Expectation<TState>[]) {
    return new Promise(resolve => {
      const subscription = this._output$.subscribe(value => {
        this._history = this._history.update('output', output => output.push(value));

        if (typeof value === 'function') {
          this._state$.next(value(this._state));
        } else {
          this._task$.next(value);
        }

        const expectation = expectations.shift();

        if (expectation) {
          expectation.assert(this.history);
        }

        if (expectations.length === 0) {
          subscription.unsubscribe();
          this.reset();
          resolve();
        }
      });

      this._task$.next(task);
    });
  }
}
