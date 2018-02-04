import Task from './Task';

describe('@memento/store/src/api/Task', () => {
  test('task parameters stored as expected', () => {
    const parameters = { a: 1, b: 2 };
    const task = new Task(parameters);

    expect(task.parameters).toEqual(parameters);
  });
});
