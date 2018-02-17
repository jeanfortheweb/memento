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
  Trigger,
  TriggerParameters,
  TriggerMap,
} from './request';

export {
  request,
  abort,
  Request,
  RequestTask,
  AbortTask,
  LifeCycleTask,
  LifeCycleTaskKind,
  Trigger,
  TriggerParameters,
  TriggerMap,
};

export default <TState extends State>(
  configuration: Partial<Configuration> = {},
): Worker<TState> => task$ => {
  const configuration$ = new BehaviorSubject<ConfigurationState>(
    new ConfigurationState(configuration),
  );

  return Observable.merge(requestAccept(configuration$, task$));
};
