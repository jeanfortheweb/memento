import { Subject } from 'rxjs';
import { model, state } from '@memento/memento';

export default model(
  () => ({
    increment: new Subject(),
    decrement: new Subject(),
  }),

  input =>
    state(
      0,
      state.action(input.increment, () => count => count + 1),
      state.action(input.decrement, () => count => count - 1),
    ),
);
