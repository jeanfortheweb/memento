import { setup, State, Expect } from '@memento/probe';
import sequence, { accept, KIND } from './sequence';
import { Task } from '@memento/store';

const assign = setup<State>(State.defaultState)(accept);
const tasks: Task[] = [{ kind: 'A', payload: null }, { kind: 'B', payload: null }];

test('toString() ouputs the kind as string', () => {
  expect(sequence.toString()).toEqual(KIND);
});

test('does forward all given tasks', async () => {
  await assign(
    sequence(...tasks),
    new Expect.TaskAssignment({
      kind: KIND,
      payload: tasks,
    }),
    new Expect.TaskAssignment(tasks[0]),
    new Expect.TaskAssignment(tasks[1]),
  );
});
