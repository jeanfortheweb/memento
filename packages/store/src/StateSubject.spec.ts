import StateSubject from './StateSubject';
import { State } from './test/mocks';

const state = new State();
const subject = new StateSubject(state);

test('select emits initially', () => {
  const handler = jest.fn();

  subject
    .select(state => state)
    .do(handler)
    .subscribe();

  expect(handler).toBeCalledWith(state);
});

test('select emits when state changes', () => {
  const nextState = state.set('propertyA', 'foo');
  const handler = jest.fn();

  subject
    .select(state => state.propertyA)
    .do(handler)
    .subscribe();

  subject.next(nextState);

  expect(handler.mock.calls).toMatchObject([[state.propertyA], [nextState.propertyA]]);
});

test('select does not emit when state is unchanged', () => {
  const handler = jest.fn();

  subject
    .select(state => state.propertyA)
    .do(handler)
    .subscribe();

  subject.next(state);
  subject.next(state);
  subject.next(state);

  expect(handler).toHaveBeenCalledTimes(2);
  expect(handler).toBeCalledWith(state.propertyA);
});
