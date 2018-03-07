import { setup, Expect, State } from '@memento/probe';
import update, { accept, KIND, UpdateTask } from './update';

const defaultState = State.defaultState;
const assign = setup<State>(defaultState)(accept);

test('toString() outputs the kind as string', () => {
  expect(update.toString()).toEqual(KIND);
});

test('produces the expected output state', async () => {
  const element = defaultState.addresses.last() as State.Address;
  const data = State.Address.generate();

  await assign(
    update<State.Address>('addresses', element, data),
    new Expect.TaskAssignment<State, UpdateTask<State.Address>>({
      kind: KIND,
      payload: {
        path: 'addresses',
        element,
        data,
      },
    }),
    new Expect.StateChange<State>(
      defaultState,
      defaultState.update('addresses', addresses =>
        addresses.set(addresses.size - 1, data),
      ),
    ),
  );
});
