import { view } from '@memento/memento';

const mapInputToActions = input => ({
  onSaveClick: () => input.save.next(),
  onClearClick: () => input.clear.next(),
});

const mapOutputToData = output => ({
  valid: output.valid,
});

export default view(mapInputToActions, mapOutputToData);
