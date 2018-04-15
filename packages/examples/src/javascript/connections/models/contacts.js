import { Subject } from 'rxjs';
import { model, state } from '@memento/memento';
import { generate } from 'shortid';
import {
  tap,
  withLatestFrom,
  sample,
  shareReplay,
  filter,
  pluck,
} from 'rxjs/operators';
import list from '../views/contacts/list';

const inputCreator = () => ({
  create: new Subject(),
  update: new Subject(),
  select: new Subject(),
  remove: new Subject(),
});

const outputCreator = input => {
  // contact output.
  const contacts = state(
    [],
    // when the create input emits, we add the emitted contact.
    state.action(input.create, contact => contacts => [
      ...contacts,
      Object.assign({}, contact, { id: generate() }),
    ]),

    // when update emits, we update the given contact.
    state.action(input.update, contact => contacts => {
      contacts[contacts.findIndex(other => other.id === contact.id)] = contact;

      return [...contacts];
    }),

    // when remove emits, we remove the contact for the emitted id.
    state.action(input.remove, id => contacts => {
      contacts.splice(contacts.findIndex(contact => contact.id === id), 1);

      return [...contacts];
    }),
  );

  // selected output
  const selected = state(
    -1,
    // action that emits current contacts everytime the create input emits.
    // select the created contact (last in array).
    state.action(contacts.pipe(sample(input.create)), contacts => () =>
      contacts[contacts.length - 1].id,
    ),

    // action that simply sets the id to the emitted one.
    state.action(input.select, id => () => id),

    // action that emits current contacts everytime the remove input emits.
    // reset the selected contact to the last one in the array.
    state.action(contacts.pipe(sample(input.remove)), contacts => () =>
      contacts[contacts.length - 1] && contacts[contacts.length - 1].id,
    ),
  );

  return {
    contacts,
    selected,
  };
};

const viewCreators = {
  List: list,
};

export default model(inputCreator, outputCreator, viewCreators);
