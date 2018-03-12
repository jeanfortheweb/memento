import { List, Record } from 'immutable';
import Generator, { generator } from './Generator';
import * as faker from 'faker';

/**
 * Defines the properties of the `ProbeState`-Record.
 */
export interface StateProps {
  host: string;
  port: number;
  addresses: List<State.Address>;
}

/**
 * The `ProbeState` is a `State` implementation for common testing purposes.
 * It contains a variety of data structures to mimic real world application scenarios.
 */
class State extends Record<StateProps>({
  host: '',
  port: 0,
  addresses: List(),
}) {}

namespace State {
  /**
   * Defines the properties of the `ProbeState`-Record.
   */
  export interface Props extends StateProps {}

  /**
   * Represents a fictional address.
   */
  export class Address extends Record<Address.Props>({
    street: '',
    postalCode: '',
    country: '',
    state: '',
  }) {}

  export namespace Address {
    /**
     * Defines the properties of the `AddressState`-Record.
     */
    export interface Props {
      street: string;
      postalCode: string;
      country: string;
      state: string;
    }

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

  export const generate: Generator<State> = generator(
    () =>
      new State({
        host: faker.internet.domainName(),
        port: faker.random.number({ min: 1111, max: 9999 }),
        addresses: List(State.Address.generate(5, 10)),
      }),
  );

  export const defaultState = State.generate();
}

export default State;
