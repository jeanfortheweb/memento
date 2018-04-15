import { view } from '@memento/memento';
import { pluck } from 'rxjs/operators';

const mapInputToActions = input => ({
  onChangeFirstName: event =>
    input.change.next({ field: 'firstName', value: event.target.value }),
  onChangeLastName: event =>
    input.change.next({ field: 'lastName', value: event.target.value }),
  onChangePhone: event =>
    input.change.next({ field: 'phone', value: event.target.value }),
});

const mapOutputToData = output => ({
  contact: output.contact,
});

export default view(mapInputToActions, mapOutputToData);
