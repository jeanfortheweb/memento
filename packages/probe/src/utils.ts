import { List } from 'immutable';
import * as faker from 'faker';
import { Task, Worker } from '@memento/store';
import ProbeState from './ProbeState';
import ProbeStore from './ProbeStore';
import Expectation from './Expectation';

/**
 * Creates an array of a random length where each element is created by the
 * provided factory function.
 *
 * @param min Minimum array length.
 * @param max Maximum array length.
 * @param factory Factory for creating elements.
 */
const randomArray = <T>(min: number, max: number, factory: () => T): T[] => {
  const array: T[] = [];
  const length = faker.random.number({ min, max });

  for (let i = 0; i < length; i++) {
    array.push(factory());
  }

  return array;
};

/**
 * Generates a new `ProbeState` instance with an optional seed.
 *
 * @param seed The seed to use
 */
export const generate = (seed?: number) => {
  if (seed) {
    faker.seed(seed);
  }

  return new ProbeState({
    host: faker.internet.ip(),
    port: faker.random.number({ min: 1000, max: 9999 }),

    addresses: List(
      randomArray(
        1,
        10,
        () =>
          new ProbeState.Address({
            street: faker.address.streetAddress(),
            postalCode: faker.address.zipCode(),
            country: faker.address.country(),
            state: faker.address.state(),
          }),
      ),
    ),
  });
};

/**
 * A default `ProbeState` instance with a fixed seed.
 */
export const defaultState = generate(180293);

/**
 * Creates a curried setup chain which leads to a `run` on a `ProbeStore`.
 * This utility works only the `ProbeState` implementation.
 *
 * @param initialState The initial state for the store.
 */
export const setup = (initialState = defaultState) => (worker: Worker<ProbeState>) => (
  task: Task,
  ...expectations: Expectation<ProbeState>[]
) => new ProbeStore(initialState, worker).run(task, ...expectations);
