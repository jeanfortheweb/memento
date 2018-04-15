import { Subject, combineLatest } from 'rxjs';
import {
  map,
  partition,
  tap,
  withLatestFrom,
  share,
  filter,
  shareReplay,
  mapTo,
} from 'rxjs/operators';
import { model, state } from '@memento/memento';

export default model(
  () => ({
    // inputs served by the contacts model.
    contacts: new Subject(),
    selected: new Subject(),

    // our own inputs.
    change: new Subject(),
    save: new Subject(),
    clear: new Subject(),
  }),

  input => {
    // just an empty contact.
    const emptyContact = { firstName: '', lastName: '', phone: '' };

    const contact = state(
      emptyContact,

      // get the contact data from the contacts output using the selected id.
      // if the contact data is not present, we dispay empty contact data.
      state.action(
        input.selected.pipe(withLatestFrom(input.contacts)),
        ([id, contacts]) => () =>
          contacts.find(contact => contact.id === id) || emptyContact,
      ),

      // field change input: update the contact property.
      state.action(input.change, ([field, value]) => contact =>
        Object.assign({}, contact, {
          [field]: value,
        }),
      ),

      // clear the current contact data.
      state.action(input.clear, () => () => emptyContact),
    );

    // create two observables:
    // create emits when it is a new contact (without id), update otherwise.
    const [create, update] = input.save
      .pipe(withLatestFrom(contact), map(([, contact]) => contact))
      .pipe(partition(contact => contact.id === undefined));

    // contact data is valid when firstName and lastName is set.
    const valid = contact.pipe(
      map(
        contact =>
          contact.firstName.length === 0 || contact.lastName.length === 0,
      ),
    );

    // reset selection when clear emits.
    const select = input.clear.pipe(mapTo(-1));

    return {
      // our own outputs.
      contact,
      valid,

      // outputs for the contacts model
      create,
      update,
      select,
    };
  },
);
