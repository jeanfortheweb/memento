import taskCreator from './task';

test('does create a task creator as expected', () => {
  const creator0 = taskCreator('@TEST/TASK_A');

  expect(creator0).toBeInstanceOf(Function);
  expect(creator0.kind).toEqual('@TEST/TASK_A');
  expect(creator0.toString()).toEqual(creator0.kind);
  expect(creator0()).toMatchObject({
    kind: '@TEST/TASK_A',
  });

  const creator1 = taskCreator('@TEST/TASK_B', () => ({ parameterA: 0, parameterB: 0 }));

  expect(creator1).toBeInstanceOf(Function);
  expect(creator1.kind).toEqual('@TEST/TASK_B');
  expect(creator1.toString()).toEqual(creator1.kind);
  expect(creator1()).toMatchObject({
    kind: '@TEST/TASK_B',
    parameterA: 0,
    parameterB: 0,
  });

  const creator2 = taskCreator('@TEST/TASK_A', (parameterA: string, parameterB: string) => ({
    parameterA,
    parameterB,
  }));

  expect(creator2).toBeInstanceOf(Function);
  expect(creator2.kind).toEqual('@TEST/TASK_A');
  expect(creator2.toString()).toEqual(creator2.kind);
  expect(creator2('foo', 'bar')).toMatchObject({
    kind: '@TEST/TASK_A',
    parameterA: 'foo',
    parameterB: 'bar',
  });
});
