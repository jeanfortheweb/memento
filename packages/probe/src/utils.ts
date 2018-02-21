import { Task, Worker, State } from '@memento/store';
import { random } from 'faker';
import ProbeStore from './ProbeStore';
import Expectation from './Expectation';

/**
 * Represents a value generator.
 */
export interface Generator<T> {
  (): T;
  (min: number, max: number): T[];
}

function* counter(count: number) {
  let i = 0;

  while (i < count) {
    yield ++i;
  }
}

/**
 * Creates a value genereator based on a given factory.
 *
 * @param factory The factory for generated values.
 */
export const generator = <T>(factory: () => T): Generator<T> => (
  min?: number,
  max?: number,
): any => {
  const values: T[] = [];
  const count = random.number({ min: min || 1, max: max || min || 1 });
  const iterator = counter(count);

  while (iterator.next().done === false) {
    values.push(factory());
  }

  if (min === undefined && max === undefined) {
    return values.pop() as T;
  }

  return values;
};

/**
 * Creates a curried setup chain which leads to a `run` on a `ProbeStore`.
 *
 * @param initialState The initial state for the store.
 */
export const setup = <TState extends State>(initialState) => (worker: Worker<TState>) => (
  task: Task,
  ...expectations: Expectation<TState>[]
) => new ProbeStore(initialState, worker).run(task, ...expectations);
