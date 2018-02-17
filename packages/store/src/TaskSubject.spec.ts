import { TaskA, TaskB, taskA } from './test/mocks';
import TaskSubject from './TaskSubject';

const subject = new TaskSubject();

test('accept emits on match', () => {
  const handler = jest.fn();

  subject
    .accept<TaskA>('@TEST/TASK_A')
    .do(handler)
    .subscribe();

  subject.next(taskA);

  expect(handler).toBeCalledWith(taskA);
});

test('accept does not emit on mismatch', () => {
  const handler = jest.fn();

  subject
    .accept<TaskB>('@TEST/TASK_B')
    .do(handler)
    .subscribe();

  subject.next(taskA);

  expect(handler).toHaveBeenCalledTimes(0);
});
