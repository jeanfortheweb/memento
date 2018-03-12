import { State } from '@memento/probe';
import { List, fromJS } from 'immutable';
import { create } from './';

const addressesReviver = create<State.Address.Props[], List<State.Address>>(sequence =>
  sequence.toList().map(address => new State.Address(address)),
);

const configurationReviver = create<State.Configuration.Props, State.Configuration>(
  sequence => new State.Configuration(sequence),
  {
    includes: sequence => sequence.toList(),
  },
);

const stateReviver = create<State.Props, State>(sequence => new State(sequence), {
  addresses: addressesReviver,
  configuration: configurationReviver,
});

test('creates the expected state object from json', () => {
  const revived = fromJS(State.defaultState.toJS(), stateReviver) as State;

  console.log(revived);
  expect(revived).toMatchObject(State.defaultState);
  expect(revived.addresses).toBeInstanceOf(List);
  expect(revived.configuration).toBeInstanceOf(State.Configuration);
  expect(revived.configuration && revived.configuration.includes).toBeInstanceOf(List);
});
