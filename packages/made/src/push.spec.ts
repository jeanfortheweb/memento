import { setup, Expect, State } from '@memento/probe';
import push, { accept, KIND, PushTask } from './push';

const defaultState = State.defaultState;
const run = setup<State>(defaultState)(accept);

test('toString() ouputs the kind as string', () => {
  expect(push.toString()).toEqual(KIND);
});

test('produces the expected output state', async () => {
  const data1 = State.Address.generate();
  const data2 = State.Address.generate();

  await run(
    push<State.Address>('addresses', data1, data2),
    new Expect.StateChangeTask<State, PushTask<State.Address>>(
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
