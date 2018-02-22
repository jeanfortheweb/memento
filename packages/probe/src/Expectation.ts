import { State, Task } from '@memento/store';
import History from './History';

/**
 * Expectation.
 */
interface Expectation<TState extends State> {
  assert(history: History<TState>);
}

namespace Expectation {
  /**
   * Allows to make a group of expectations on a single emission cycle of the store.
   */
  export class Group<TState extends State> implements Expectation<TState> {
    private _expectations: Expectation<TState>[];

    /**
     * @param expectations The expectations to make.
     */
    constructor(...expectations: Expectation<TState>[]) {
      this._expectations = expectations;
    }

    /**
     * @inheritDoc
     */
    assert(history: History<TState>) {
      this._expectations.map(expectation => expectation.assert(history));
    }
  }
  /**
   * Expects a given `initialState` and a resulting `updatedState`.
   */
  export class StateChange<TState extends State> implements Expectation<TState> {
    private _initialState: TState;
    private _updatedState: TState;

    /**
     * @param initialState The initial state (or previous/current) state to expect.
     * @param updatedState The updated state to expect.
     */
    constructor(initialState: TState, updatedState: TState) {
      this._initialState = initialState;
      this._updatedState = updatedState;
    }

    /**
     * @inheritDoc
     */
    public assert(history: History<TState>): void {
      const initialState = history.state.pop().last();
      const updatedState = history.state.last();

      expect(initialState).toBeDefined();
      expect(updatedState).toBeDefined();

      if (initialState && updatedState) {
        expect(initialState.toJS()).toMatchObject(this._initialState.toJS());
        expect(updatedState.toJS()).toMatchObject(this._updatedState.toJS());
      }
    }
  }

  /**
   * Expects a given `Task` to be assigned to the store.
   */
  export class TaskAssignment<TState extends State, TTask extends Task>
    implements Expectation<TState> {
    private _task: TTask;

    /**
     * @param task The task to expect.
     */
    constructor(task: TTask) {
      this._task = task;
    }

    public assert(history: History<TState>): void {
      const task = history.task.last();

      expect(task).toBeDefined();
      expect(task).toMatchObject(this._task);
    }
  }

  /**
   * Combines a `TaskAssignment`-Expecation with a `StateChange`-Expectation.
   */
  export class StateChangeTask<TState extends State, TTask extends Task>
    implements Expectation<TState> {
    private _initialState: TState;
    private _updatedState: TState;
    private _assignedTask: TTask;

    /**
     *
     * @param assignedTask The task that is expected to be assigned.
     * @param initialState The initial state to expect.
     * @param updatedState The updated state to expect.
     */
    constructor(assignedTask: TTask, initialState: TState, updatedState: TState) {
      this._assignedTask = assignedTask;
      this._initialState = initialState;
      this._updatedState = updatedState;
    }

    /**
     * @inheritDoc
     */
    public assert(history: History<TState>): void {
      new Group(
        new TaskAssignment<TState, TTask>(this._assignedTask),
        new StateChange<TState>(this._initialState, this._updatedState),
      ).assert(history);
    }
  }
}

export default Expectation;
