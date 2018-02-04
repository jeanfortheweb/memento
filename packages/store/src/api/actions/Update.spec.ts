jest.mock('../Store');
jest.mock('../Task');

import Action from './Update';
import Store from '../Store';

describe('@memento/store/src/api/actions/Update', () => {
  test('action calls update on store', () => {
    const updater = jest.fn();
    const store = new Store({} as any, []);
    const action = new Action<any>(updater);

    action.dispatch(store);

    expect(store.update).toBeCalledWith(updater);
  });
});
