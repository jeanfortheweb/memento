import React from 'react';
import { Menu } from 'semantic-ui-react';
import store, { setActive, getActive } from './store';
import { View, Trigger } from '@memento/react';

export const Item = ({ name, icon }) => (
  <View store={store} active={getActive}>
    {({ active }) => (
      <Trigger store={store} onClick={setActive(name)}>
        {({ onClick }) => (
          <Menu.Item
            icon={icon}
            content={name}
            name={name}
            active={active === name}
            onClick={onClick}
          />
        )}
      </Trigger>
    )}
  </View>
);

const AppMenu = () => (
  <Menu color="teal" vertical>
    <Menu.Item header content="Memento Examples" />
    <Item icon="check" name="Todos" />
    <Item icon="chat" name="Echo Chat" />
  </Menu>
);

export default AppMenu;
