import { setup, defaultState, Expectation, ProbeState } from '@memento/probe';
import push, { accept, KIND, PushTask } from './push';

const run = setup(defaultState)(accept);

test('toString() ouputs the kind as string', () => {
  expect(push.toString()).toEqual(KIND);
});

test('produces the expected output state', async () => {
  const data1 = ProbeState.Address.generate();
  const data2 = ProbeState.Address.generate();

  await run(
    push<ProbeState.Address>('addresses', data1, data2),
    new Expectation.StateChangeTask<ProbeState, PushTask<ProbeState.Address>>(
      {
        kind: KIND,
        payload: {
          path: 'addresses',
          data: [data1, data2],
        },
      },
      defaultState,
      defaultState.update('addresses', addresses => addresses.push(data1, data2)),
    ),
  );
});
