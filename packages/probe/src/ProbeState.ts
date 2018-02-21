import { List, Record } from 'immutable';

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
export class AddressState extends Record<AddressProps>({
  street: '',
  postalCode: '',
  country: '',
  state: '',
}) {}

/**
 * Defines the properties of the `ProbeState`-Record.
 */
export interface ProbeProps {
  host: string;
  port: number;
  addresses: List<AddressProps>;
}

/**
 * The `ProbeState` is a `State` implementation for common testing purposes.
 * It contains a variety of data structures to mimic real world application scenarios.
 */
export default class ProbeState extends Record<ProbeProps>({
  host: '',
  port: 0,
  addresses: List(),
}) {}
