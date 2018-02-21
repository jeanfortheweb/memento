import { List, Record } from 'immutable';
import * as faker from 'faker';

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
    export const generate = () =>
      new Address({
        street: faker.address.streetAddress(),
        postalCode: faker.address.zipCode(),
        country: faker.address.country(),
        state: faker.address.state(),
      });
  }
}

export default ProbeState;
