jest.mock('../Store');
jest.mock('../Task');

import Action from './Assign';
import Task from '../Task';
import Store from '../Store';

test('action calls assign on store', () => {
  const task = new Task();
  const store = new Store({} as any, []);
  const action = new Action<any, any>(task);

  action.dispatch(store);

  expect(store.assign).toBeCalledWith(task);
});
