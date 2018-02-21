import { State } from '@memento/store';
import { History } from './History';

/**
 * Expectation.
 */
abstract class Expectation<TState extends State> {
  public abstract assert(history: History<TState>);
}

/**
 * Contains several common expectations to make.
 */
namespace Expectation {
  /**
   * Expects a given `initialState` and a resulting `updatedState` after one `Store`-Cycle.
   */
  export class StateChange<TState extends State> extends Expectation<TState> {
    private _initialState: TState;
    private _updatedState: TState;

    /**
     * Creates a new `StateChange`-Expectation.
     *
     * @param initialState The initial state (or previous/current) state to expect.
     * @param updatedState The updated state to expect.
     */
    constructor(initialState: TState, updatedState: TState) {
      super();

      this._initialState = initialState;
      this._updatedState = updatedState;
    }

    assert(history: History<TState>) {
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
}

export default Expectation;
