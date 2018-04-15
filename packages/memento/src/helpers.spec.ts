import { state } from './helpers';
import { Subject, Observable } from 'rxjs';
import { mapTo } from 'rxjs/operators';

function getStateValue<T>(state$: Observable<T>): Promise<T> {
  return new Promise(resolve => {
    const subscription = state$.subscribe(value => {
      resolve(value);
    });

    subscription.unsubscribe();
  });
}

describe('state', () => {
  const increment$ = new Subject();
  const decrement$ = new Subject();
  const state$ = state(
    0,
    state.action(increment$, () => count => count + 1),
    state.action(decrement$, () => count => count - 1),
  );

  test('should create a state observable', () => {
    expect(state$).toBeInstanceOf(Observable);
  });

  test('should update the state', async () => {
    let value = await getStateValue(state$);

    expect(value).toEqual(0);

    increment$.next();

    value = await getStateValue(state$);

    expect(value).toEqual(1);

    decrement$.next();

    value = await getStateValue(state$);

    expect(value).toEqual(0);
  });
});
