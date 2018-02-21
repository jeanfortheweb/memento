import { Task, Worker, State } from '@memento/store';
import ProbeStore from './ProbeStore';
import ProbeState from './ProbeState';
import ProbeExpectation from './ProbeExpectation';
import ProbeHistory from './ProbeHistory';

namespace Probe {
  export const Store = ProbeStore;
  export const State = ProbeState;
  export const Expect = ProbeExpectation;
  export const History = ProbeHistory;

  /**
   * Creates a curried setup chain which leads to a `run` on a `ProbeStore`.
   *
   * @param initialState The initial state for the store.
   */
  export const setup = <TState extends State>(initialState) => (worker: Worker<TState>) => (
    task: Task,
    ...expectations: ProbeExpectation<TState>[]
  ) => new ProbeStore(initialState, worker).run(task, ...expectations);
}

export default Probe;
