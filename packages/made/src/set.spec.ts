import { setup, Expect, State } from '@memento/probe';
import set, { accept, KIND, SetTask } from './set';

const defaultState = State.defaultState;
const assign = setup<State>(defaultState)(accept);

test('toString() outputs the kind as string', () => {
  expect(set.toString()).toEqual(KIND);
});

test('produces the expected output state', async () => {
  const data = 'Foostr. 23';

  await assign(
    set<string>('addresses.0.street', data),
    new Expect.TaskAssignment<State, SetTask<string>>({
      kind: KIND,
      payload: {
        path: 'addresses.0.street',
        data,
      },
    }),
    new Expect.StateChange<State>(
      defaultState,
      defaultState.update('addresses', addresses => addresses.setIn([0, 'street'], data)),
    ),
  );
});
