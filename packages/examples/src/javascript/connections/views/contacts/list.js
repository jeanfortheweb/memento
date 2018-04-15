import { view } from '@memento/memento';

const mapInputToActions = input => ({
  onSelect: id => input.select.next(id),
  onRemoveClick: id => input.remove.next(id),
});

const mapOutputToData = output => ({
  contacts: output.contacts,
  selected: output.selected,
});

export default view(mapInputToActions, mapOutputToData);
