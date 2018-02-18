import { Task, TaskObservable, createTask, TaskCreator1 } from '@memento/store';
import { Observable, AjaxRequest, AjaxResponse } from '@reactivex/rxjs';
import { ConfigurationState } from './configuration';

export const KIND_REQUEST = '@FETCHER/REQUEST';
export const KIND_BEFORE = '@FETCHER/REQUEST/BEFORE';
export const KIND_SUCCESS = '@FETCHER/REQUEST/SUCCESS';
export const KIND_FAILURE = '@FETCHER/REQUEST/FAILURE';
export const KIND_AFTER = '@FETCHER/REQUEST/AFTER';
export const KIND_ABORT = '@FETCHER/ABORT';

export interface Request extends AjaxRequest {
  name?: string;
  tags?: string[];
}

export type LifeCycleTaskKind =
  | typeof KIND_BEFORE
  | typeof KIND_SUCCESS
  | typeof KIND_FAILURE
  | typeof KIND_AFTER;

export interface LifeCycleTaskPayload {
  request: AjaxRequest;
  name?: string;
  tags?: string[];
  response?: AjaxResponse;
  error?: Error;
}

export type LifeCycleTask = Task<LifeCycleTaskKind, LifeCycleTaskPayload>;

export type RequestTask = Task<typeof KIND_REQUEST, Partial<Request>>;
export type AbortTask = Task<typeof KIND_ABORT, string>;

export const abort: TaskCreator1<typeof KIND_ABORT, string, string> = createTask(
  KIND_ABORT,
  (name: string) => name,
);

export const request: TaskCreator1<
  typeof KIND_REQUEST,
  Partial<Request>,
  Partial<Request>
> = createTask(KIND_REQUEST, (request: Partial<Request>) => request);

const before = createTask(KIND_BEFORE, (payload: Partial<LifeCycleTaskPayload>) => payload);
const success = createTask(KIND_SUCCESS, (payload: Partial<LifeCycleTaskPayload>) => payload);
const failure = createTask(KIND_FAILURE, (payload: Partial<LifeCycleTaskPayload>) => payload);
const after = createTask(KIND_AFTER, (payload: Partial<LifeCycleTaskPayload>) => payload);

const createAjaxRequest = (
  name: string | undefined,
  tags: string[] | undefined,
  parameters: AjaxRequest,
  configuration: ConfigurationState,
): AjaxRequest => {
  return configuration.mergeDeep(parameters).toJS();
};

export const accept = (
  configuration$: Observable<ConfigurationState>,
  task$: TaskObservable,
): Observable<Task> =>
  task$
    .accept<RequestTask>(KIND_REQUEST)
    .withLatestFrom(configuration$)
    .flatMap(([task, configuration]) => {
      const { name = '', tags = [], ...parameters } = task.payload;
      const request = createAjaxRequest(name, tags, parameters, configuration);
      const lifeCycleParameters = {
        name,
        tags,
        request,
      };

      /* istanbul ignore next */
      if (process.env.NODE_ENV === 'test') {
        const XHR2 = require('xhr2');
        request.createXHR = () => new XHR2();
      }

      const before$ = Observable.of(before(lifeCycleParameters));
      const after$ = Observable.of(after(lifeCycleParameters));

      const abort$ = task$
        .accept<AbortTask>(KIND_ABORT)
        .filter(abortTask => abortTask.payload === name);

      const ajax$ = Observable.ajax(request).concatMap(response =>
        Observable.of(
          success({
            ...lifeCycleParameters,
            response,
          }),
        ),
      );

      return Observable.concat(
        before$,
        ajax$.takeUntil(abort$).catch<any, any>(error =>
          Observable.of(
            failure({
              ...lifeCycleParameters,
              error,
            }),
          ),
        ),
        after$,
      );
    });
