import { Worker, State } from '@memento/store';
import { Observable } from '@reactivex/rxjs';
import { Configuration } from './configuration';

import { save, SaveTask, accept as saveAccept } from './save';
import { load, LoadTask, accept as loadAccept } from './load';

export { save, SaveTask };
export { load, LoadTask };

export default <TState extends State<TStateProps>, TStateProps extends Object>(
  configuration: Configuration,
): Worker<TState> => {
  return (task$, state$) =>
    Observable.merge(
      saveAccept<TState>(configuration)(task$, state$),
      loadAccept<TState>(configuration)(task$, state$),
    );
};
