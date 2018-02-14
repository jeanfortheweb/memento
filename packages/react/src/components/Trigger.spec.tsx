import * as React from 'react';
import { Record } from 'immutable';
import { configure, mount } from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';
import { Store } from '@memento/store';
import { createStateUpdater, updateState } from '@memento/common';
import Trigger from './Trigger';

configure({ adapter: new Adapter() });

interface StateProps {
  text: string;
}

class State extends Record<StateProps>({
  text: '',
}) {}

const store = new Store(new State(), [createStateUpdater<State, StateProps>()]);
const StringTrigger = Trigger.for<State, string>();

test('a trigger does call its factory on invocation', () => {
  const render = jest.fn(onClick => <button onClick={() => onClick('Hello')}>button</button>);
  const factory = jest.fn(text => updateState({ text }));
  const wrapper = mount(
    <StringTrigger store={store} factory={factory}>
      {render}
    </StringTrigger>,
  );

  wrapper.find('button').simulate('click');

  expect(render).toHaveBeenCalledTimes(1);
  expect(factory).toHaveBeenCalledWith('Hello');
});
