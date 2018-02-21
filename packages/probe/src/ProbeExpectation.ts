import { State, Task } from '@memento/store';
import { ProbeHistory } from './ProbeHistory';

/**
 * Expectation.
 */
abstract class Expectation<TState extends State> {
  public abstract assert(history: ProbeHistory<TState>);
}

/**
 * Contains several common expectations to make.
 */
namespace Expectation {
  /**
   * Allows to make a group of expectations on a single emission cycle of the store.
   */
  export class Group<TState extends State> extends Expectation<TState> {
    private _expectations: Expectation<TState>[];

    /**
     * @param expectations The expectations to make.
     */
    constructor(...expectations: Expectation<TState>[]) {
      super();

      this._expectations = expectations;
    }

    /**
     * @inheritDoc
     */
    assert(history: ProbeHistory<TState>) {
      this._expectations.map(expectation => expectation.assert(history));
    }
  }
  /**
   * Expects a given `initialState` and a resulting `updatedState`.
   */
  export class StateChange<TState extends State> extends Expectation<TState> {
    private _initialState: TState;
    private _updatedState: TState;

    /**
     * @param initialState The initial state (or previous/current) state to expect.
     * @param updatedState The updated state to expect.
     */
    constructor(initialState: TState, updatedState: TState) {
      super();

      this._initialState = initialState;
      this._updatedState = updatedState;
    }

    /**
     * @inheritDoc
     */
    public assert(history: ProbeHistory<TState>): void {
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
  export class TaskAssignment<TState extends State, TTask extends Task> extends Expectation<
    TState
  > {
    private _task: TTask;

    /**
     * @param task The task to expect.
     */
    constructor(task: TTask) {
      super();

      this._task = task;
    }

    public assert(history: ProbeHistory<TState>): void {
      const task = history.task.last();

      expect(task).toBeDefined();
      expect(task).toMatchObject(this._task);
    }
  }

  /**
   * Combines a `TaskAssignment`-Expecation with a `StateChange`-Expectation.
   */
  export class StateChangeTask<TState extends State, TTask extends Task> extends Expectation<
    TState
  > {
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
      super();

      this._assignedTask = assignedTask;
      this._initialState = initialState;
      this._updatedState = updatedState;
    }

    /**
     * @inheritDoc
     */
    public assert(history: ProbeHistory<TState>): void {
      new Expectation.Group(
        new Expectation.TaskAssignment<TState, TTask>(this._assignedTask),
        new Expectation.StateChange<TState>(this._initialState, this._updatedState),
      ).assert(history);
    }
  }
}

export default Expectation;
