import { setup, Expectation, ProbeState } from '@memento/probe';
import update, { accept, KIND, UpdateTask } from './update';

const defaultState = ProbeState.defaultState;
const run = setup<ProbeState>(defaultState)(accept);

test('toString() ouputs the kind as string', () => {
  expect(update.toString()).toEqual(KIND);
});

test('produces the expected output state', async () => {
  const element = defaultState.addresses.last() as ProbeState.Address;
  const data = ProbeState.Address.generate();

  await run(
    update<ProbeState.Address>('addresses', element, data),
    new Expectation.StateChangeTask<ProbeState, UpdateTask<ProbeState.Address>>(
      {
        kind: KIND,
        payload: {
          path: 'addresses',
          element,
          data,
        },
      },
      defaultState,
      defaultState.update('addresses', addresses => addresses.set(addresses.size - 1, data)),
    ),
  );
});
