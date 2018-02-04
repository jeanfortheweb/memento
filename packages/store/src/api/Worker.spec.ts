import Worker from './Worker';
import { Subject, Observable } from '@reactivex/rxjs';

class TestAction {}
class TestTask {}
class TestWorker extends Worker<any, any> {
  for() {
    return TestTask;
  }

  setup(task$) {
    return task$.mapTo(new TestAction());
  }
}

const testWorker = new TestWorker();

test('for() returns the correct task constructor', () => {
  expect(testWorker.for()).toEqual(TestTask);
});

test('setup returns an observable emitting the correct action type', done => {
  const subject = new Subject<TestTask>();
  const observable = testWorker.setup(subject);

  observable.subscribe(action => {
    expect(action).toBeInstanceOf(TestAction);
    done();
  });

  subject.next(new TestTask());
});
