import { List, Record } from 'immutable';
import * as faker from 'faker';

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
const generator = <T>(factory: () => T): Generator<T> => (min?: number, max?: number): any => {
  const values: T[] = [];
  const count = faker.random.number({ min: min || 1, max: max || min || 1 });
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
 * Defines the properties of the `ProbeState`-Record.
 */
export interface ProbeProps {
  host: string;
  port: number;
  addresses: List<ProbeState.Address>;
}

/**
 * The `ProbeState` is a `State` implementation for common testing purposes.
 * It contains a variety of data structures to mimic real world application scenarios.
 */
class ProbeState extends Record<ProbeProps>({
  host: '',
  port: 0,
  addresses: List(),
}) {}

namespace ProbeState {
  /**
   * Defines the properties of the `AddressState`-Record.
   */
  export interface AddressProps {
    street: string;
    postalCode: string;
    country: string;
    state: string;
  }

  /**
   * Represents a fictional address.
   */
  export class Address extends Record<AddressProps>({
    street: '',
    postalCode: '',
    country: '',
    state: '',
  }) {}

  export namespace Address {
    export const generate: Generator<Address> = generator(
      () =>
        new Address({
          street: faker.address.streetAddress(),
          postalCode: faker.address.zipCode(),
          country: faker.address.country(),
          state: faker.address.state(),
        }),
    );
  }

  export const generate: Generator<ProbeState> = generator(
    () =>
      new ProbeState({
        addresses: List(Address.generate(5, 10)),
      }),
  );

  /**
   * A default `ProbeState` instance with a fixed seed.
   */
  export const defaultState = generate();
}

export default ProbeState;
