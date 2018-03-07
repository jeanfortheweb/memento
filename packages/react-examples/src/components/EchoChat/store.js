import { Record, List } from 'immutable';
import { Store } from '@memento/store';
import createMade, { set, push } from '@memento/made';
import createSnitch, { listen } from '@memento/snitch';
import createSupervisor, { sequence } from '@memento/supervisor';
import createHotline, {
  connect,
  disconnect,
  close,
  open,
  send,
  receive,
} from '@memento/hotline';

class Message extends Record({
  date: 0,
  username: '',
  text: '',
}) {}

class State extends Record({
  username: '',
  text: '',
  isConnected: false,
  messages: List(),
}) {}

export const setUsername = event => set('username', event.target.value);
export const getUsername = state => state.username;

export const setText = event => set('text', event.target.value);
export const getText = state => state.text;

export const sendChatMessage = (username, text) => () => {
  const sendMessage = send({
    username,
    text,
    date: Date.now(),
  });

  const clearText = set('text', '');

  return sequence(sendMessage, clearText);
};

export const getMessages = state => state.messages;
export const isConnected = state => state.isConnected;
export const connectToChat = () => connect('ws://echo.websocket.org');
export const disconnectFromChat = () => disconnect();

const registerListeners = () => {
  const onConnect = listen(open, () => set('isConnected', true));
  const onReceive = listen(receive, ({ data }) => push('messages', new Message(data)));
  const onClose = listen(close, () =>
    sequence(set('isConnected', false), set('messages', List())),
  );

  return sequence(onConnect, onClose, onReceive);
};

const store = new Store(new State(), [
  createMade(),
  createHotline(),
  createSnitch(),
  createSupervisor(),
]);

store.assign(registerListeners());

export default store;
