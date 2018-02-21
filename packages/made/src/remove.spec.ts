import { List } from 'immutable';
import { setup, Expectation, ProbeState } from '@memento/probe';
import remove, { accept, KIND, RemoveTask } from './remove';

const defaultState = ProbeState.defaultState;
const run = setup<ProbeState>(defaultState)(accept);

test('toString() ouputs the kind as string', () => {
  expect(remove.toString()).toEqual(KIND);
});

test('produces the expected output state', async () => {
  const data = defaultState.addresses.toArray();

  await run(
    remove<ProbeState.Address>('addresses', ...data),
    new Expectation.StateChangeTask<ProbeState, RemoveTask<ProbeState.Address>>(
      {
        kind: KIND,
        payload: {
          path: 'addresses',
          data,
        },
      },
      defaultState,
      defaultState.update('addresses', addresses => List()),
    ),
  );
});
