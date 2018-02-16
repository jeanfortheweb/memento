import { State, Task, TaskObservable } from '@memento/store';
import { Observable, AjaxRequest, AjaxResponse } from '@reactivex/rxjs';
import { Configuration } from './configuration';

export interface TriggerParameters {
  request: AjaxRequest;
  response?: AjaxResponse;
  error?: Error;
}

export interface Trigger<TState extends State> {
  (parameters: TriggerParameters): Task<TState>;
}

export interface TriggerMap<TState extends State> {
  before: Trigger<TState>;
  success: Trigger<TState>;
  failure: Trigger<TState>;
  after: Trigger<TState>;
}

export interface Request<TState extends State> extends AjaxRequest {
  name?: string;
  tags?: string[];
  triggers?: Partial<TriggerMap<TState>>;
}

export type LifeCycleTaskKind =
  | '@FETCHER/BEFORE'
  | '@FETCHER/SUCCESS'
  | '@FETCHER/FAILURE'
  | '@FETCHER/AFTER'
  | '@FETCHER/NO_TRIGGER';

export interface LifeCycleTask<TState extends State> extends Task<TState> {
  kind: LifeCycleTaskKind;
  request: AjaxRequest;
  name?: string;
  tags?: string[];
  response?: AjaxResponse;
  error?: Error;
}

export interface RequestTask<TState extends State> extends Task<TState> {
  kind: '@FETCHER/REQUEST';
  request: Partial<Request<TState>>;
}

export interface AbortTask<TState extends State> extends Task<TState> {
  kind: '@FETCHER/ABORT';
  name: string;
}

export const abort = <TState extends State>(name: string): AbortTask<TState> => ({
  kind: '@FETCHER/ABORT',
  name,
});

export const request = <TState extends State>(
  request: Partial<Request<TState>>,
): RequestTask<TState> => ({
  kind: '@FETCHER/REQUEST',
  request,
});

const createAjaxRequest = <TState extends State>(
  name: string | undefined,
  tags: string[] | undefined,
  request: AjaxRequest,
  configuration: Configuration<TState>,
): AjaxRequest => {
  return {
    ...request,
    url: `${configuration.baseURL}${request.url}`,
  };
};

const getTrigger = <TState extends State>(trigger?: Trigger<TState>): Trigger<TState> =>
  typeof trigger === 'function' ? trigger : () => ({ kind: '@FETCHER/NO_TRIGGER' });

interface CreateLifeCycleObservableParameters<TState extends State> {
  kind: LifeCycleTaskKind;
  name?: string;
  tags?: string[];
  request: AjaxRequest;
  response?: AjaxResponse;
  triggers: Partial<TriggerMap<TState>>;
  trigger: keyof TriggerMap<TState>;
  error?: Error;
}

const createLifeCycleObservable = <TState extends State>({
  triggers,
  trigger,
  ...parameters
}: CreateLifeCycleObservableParameters<TState>): Observable<Task<TState>> =>
  Observable.from([parameters, getTrigger(triggers[trigger])(parameters)]);

export const accept = <TState extends State>(
  configuration$: Observable<Configuration<TState>>,
  task$: TaskObservable<TState>,
): Observable<Task<TState>> =>
  task$
    .accept<RequestTask<TState>>('@FETCHER/REQUEST')
    .withLatestFrom(configuration$)
    .concatMap(([task, configuration]) => {
      const { name = '', tags = [], triggers = {}, ...parameters } = task.request;
      const request = createAjaxRequest(name, tags, parameters, configuration);
      const lifeCycleParameters = {
        name,
        tags,
        request,
        triggers,
      };

      const before$ = createLifeCycleObservable({
        ...lifeCycleParameters,
        kind: '@FETCHER/BEFORE',
        trigger: 'before',
      });

      const after$ = createLifeCycleObservable({
        ...lifeCycleParameters,
        kind: '@FETCHER/AFTER',
        trigger: 'after',
      });

      const abort$ = task$
        .accept<AbortTask<TState>>('@FETCHER/ABORT')
        .filter(abortTask => abortTask.name === name)
        .flatMap(() => after$);

      const ajax$ = Observable.ajax(request).concatMap(response =>
        Observable.merge(
          createLifeCycleObservable({
            ...lifeCycleParameters,
            kind: '@FETCHER/SUCCESS',
            response,
            trigger: 'success',
          }),
          after$,
        ),
      );

      return Observable.merge(
        abort$,
        Observable.merge(before$, ajax$)
          .takeUntil(abort$)
          .catch<any, any>(error =>
            Observable.merge(
              createLifeCycleObservable({
                ...lifeCycleParameters,
                kind: '@FETCHER/FAILURE',
                trigger: 'failure',
              }),
              after$,
            ),
          ),
      );
    });
