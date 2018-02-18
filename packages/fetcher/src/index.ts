import { Worker, State } from '@memento/store';
import { Observable, BehaviorSubject } from '@reactivex/rxjs';
import { Configuration, ConfigurationState } from './configuration';
import {
  accept as requestAccept,
  request,
  abort,
  Request,
  RequestTask,
  AbortTask,
  LifeCycleTask,
  LifeCycleTaskKind,
} from './request';

export { request, abort, Request, RequestTask, AbortTask, LifeCycleTask, LifeCycleTaskKind };

export default <TState extends State>(
  /* istanbul ignore next */
  configuration: Partial<Configuration> = {},
): Worker<TState> => task$ => {
  const configuration$ = new BehaviorSubject<ConfigurationState>(
    new ConfigurationState(configuration),
  );

  return Observable.merge(requestAccept(configuration$, task$));
};
