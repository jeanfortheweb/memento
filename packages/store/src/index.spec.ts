import { Store, Command } from './';
import { Record } from 'immutable';

describe('@memento/store', () => {
  interface StateShape {
    username: string;
    age: number;
  }

  class State extends Record<StateShape>({
    username: 'Foo',
    age: 1337,
  }) {}

  const store = new Store(new State());

  test('initial state matches up', () => {
    expect(store.state.toJS()).toMatchObject({
      username: 'Foo',
      age: 1337,
    });
  });

  test('dispatching an action results in a pure state modification', () => {
    store.dispatch(state => state.set('username', 'Bar'));

    expect(store.state.toJS()).toMatchObject({
      username: 'Bar',
      age: 1337,
    });

    const prevState = store.state;

    store.dispatch(state => state.set('username', 'Bar'));

    const nextState = store.state;

    expect(nextState).toEqual(prevState);
  });

  test('state changes trigger watchers', () => {
    const watcher = jest.fn();
    const stopWatcher = store.subscribe(watcher);

    expect(typeof stopWatcher).toEqual('function');

    store.dispatch(state => state.set('username', 'Bar'));

    expect(watcher.mock.calls.length).toEqual(0);

    store.dispatch(state => state.set('username', 'Baz'));

    expect(watcher.mock.calls.length).toEqual(1);

    stopWatcher();

    store.dispatch(state => state.set('username', 'Bao'));

    expect(watcher.mock.calls.length).toEqual(1);
  });

  test('effects', async () => {
    const wait = (time: number) =>
      new Promise(resolve =>
        setTimeout(() => {
          console.log('waited for a while');
          resolve();
        }, time),
      );

    class Job1 extends Command<State> {
      *run() {
        yield this.dispatch(state => state.set('username', 'Meh'));
        yield this.call(wait, 1000);
        const state = yield this.select(state => state.username);
        console.log(state);
      }
    }

    class Job2 extends Command<State> {
      *run() {
        yield this.call(wait, 2000);
        yield this.dispatch(state => state.set('username', 'Meh2'));
        const state: string = yield this.select(state => state.username);
        console.log(state);
        yield this.dispatch(state => new Job1());
      }
    }

    store.dispatch(state => new Job1());
    store.dispatch(state => new Job2());

    await wait(4500);
  });
});
