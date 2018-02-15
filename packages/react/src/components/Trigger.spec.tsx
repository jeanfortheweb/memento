import * as React from 'react';
import { Record } from 'immutable';
import { configure, mount } from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';
import { Store } from '@memento/store';
import Trigger from './Trigger';

configure({ adapter: new Adapter() });

interface StateProps {
  text: string;
}

class State extends Record<StateProps>({
  text: '',
}) {}

const store = new Store(new State(), []);
const StringTrigger = Trigger.for<State, { onClick: (text: string) => void }>();

test('a trigger does call its functions on invocation', () => {
  const render = jest.fn(({ onClick }) => <button onClick={() => onClick('Hello')}>button</button>);
  const factory = jest.fn();
  const wrapper = mount(
    <StringTrigger store={store} onClick={factory}>
      {render}
    </StringTrigger>,
  );

  wrapper.find('button').simulate('click');

  expect(render).toHaveBeenCalledTimes(1);
  expect(factory).toHaveBeenCalledWith('Hello');
});

test('a trigger does update its functions on prop change', () => {
  const render = jest.fn(({ onClick }) => <button onClick={() => onClick('Hello')}>button</button>);
  const newHandler = jest.fn();
  const handler = jest.fn();
  const wrapper = mount(<StringTrigger store={store} onClick={handler} render={render} />);

  wrapper.setProps({
    onClick: newHandler,
  });

  wrapper.find('button').simulate('click');

  expect(render).toHaveBeenCalledTimes(2);
  expect(handler).toHaveBeenCalledTimes(0);
  expect(newHandler).toHaveBeenCalledTimes(1);
  expect(newHandler).toHaveBeenCalledWith('Hello');
});
