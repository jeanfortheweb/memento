import { setup, defaultState, Expectation, ProbeState } from '@memento/probe';
import merge, { accept, KIND, MergeTask } from './merge';

const run = setup(defaultState)(accept);

test('toString() ouputs the kind as string', () => {
  expect(merge.toString()).toEqual(KIND);
});

test('produces the expected output state', async () => {
  await run(
    merge({
      host: 'github.com',
    }),
    new Expectation.StateChangeTask<ProbeState, MergeTask<ProbeState>>(
      {
        kind: KIND,
        payload: {
          host: 'github.com',
        },
      },
      defaultState,
      defaultState.set('host', 'github.com'),
    ),
  );
});
