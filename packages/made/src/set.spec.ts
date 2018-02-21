import { setup, defaultState, Expectation, ProbeState } from '@memento/probe';
import set, { accept, KIND, SetTask } from './set';

const run = setup(defaultState)(accept);

test('toString() ouputs the kind as string', () => {
  expect(set.toString()).toEqual(KIND);
});

test('produces the expected output state', async () => {
  const data = 'Foostr. 23';

  await run(
    set<string>('addresses.0.street', data),
    new Expectation.StateChangeTask<ProbeState, SetTask<string>>(
      {
        kind: KIND,
        payload: {
          path: 'addresses.0.street',
          data,
        },
      },
      defaultState,
      defaultState.update('addresses', addresses => addresses.setIn([0, 'street'], data)),
    ),
  );
});
