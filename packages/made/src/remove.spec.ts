import { List } from 'immutable';
import { setup, Expect, State } from '@memento/probe';
import remove, { accept, KIND, RemoveTask } from './remove';

const defaultState = State.defaultState;
const run = setup<State>(defaultState)(accept);

test('toString() ouputs the kind as string', () => {
  expect(remove.toString()).toEqual(KIND);
});

test('produces the expected output state', async () => {
  const data = defaultState.addresses.toArray();

  await run(
    remove<State.Address>('addresses', ...data),
    new Expect.StateChangeTask<State, RemoveTask<State.Address>>(
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
