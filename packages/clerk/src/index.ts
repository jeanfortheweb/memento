import { Worker, State } from '@memento/store';
import { Observable } from '@reactivex/rxjs';
import { Configuration, SaveMode, LoadMode, Target } from './configuration';

import { save, SaveTask, accept as saveAccept } from './save';
import { load, LoadTask, accept as loadAccept } from './load';

export { save, SaveTask };
export { load, LoadTask };
export { Configuration, SaveMode, LoadMode, Target };

export default <TState extends State<TStateProps>, TStateProps extends Object>(
  configuration: Configuration,
): Worker<TState> => {
  const configurationWithDefaults: Configuration = {
    load: LoadMode.Auto,
    save: SaveMode.Auto,
    target: Target.Local,
    interval: 5000,
    ...configuration,
  };

  return (task$, state$) =>
    Observable.merge(
      saveAccept<TState>(configurationWithDefaults)(task$, state$),
      loadAccept<TState>(configurationWithDefaults)(task$, state$),
    );
};
