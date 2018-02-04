import Task from './Task';

test('task parameters stored as expected', () => {
  const parameters = { a: 1, b: 2 };
  const task = new Task(parameters);

  expect(task.parameters).toEqual(parameters);
});
