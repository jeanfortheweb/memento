import { Task, Worker, State as StoreState } from '@memento/store';
import Store from './Store';
import State from './State';
import Expect from './Expectation';
import History from './History';

/**
 * Creates a curried setup chain which leads to a `run` on a `ProbeStore`.
 *
 * @param initialState The initial state for the store.
 */
export const setup = <TState extends StoreState>(initialState) => (worker: Worker<TState>) => (
  task: Task,
  ...expectations: Expect<TState>[]
) => new Store(initialState, worker).run(task, ...expectations);

export { Store, State, Expect, History };
