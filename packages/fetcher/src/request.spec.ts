import { run, FetcherState } from './test/utils';
import { abort } from './';

const before = () => ({
  kind: '@FOO/BEFORE',
});

const success = () => ({
  kind: '@FOO/SUCCESS',
});

const failure = () => ({
  kind: '@FOO/FAILURE',
});

const after = () => ({
  kind: '@FOO/AFTER',
});

const request = {
  name: 'foo',
  tags: ['foo', 'bar'],
  url: 'http://api.foo.com/get/123',
  method: 'GET',
};

const failureResponse = {
  status: 500,
};

const successResponse = {
  status: 200,
};

const fooBefore = {
  kind: '@FOO/BEFORE',
};

const fooSuccess = {
  kind: '@FOO/SUCCESS',
};

const fooFailure = {
  kind: '@FOO/FAILURE',
};

const fooAfter = {
  kind: '@FOO/AFTER',
};

const fetcher = {
  request: {
    url: request.url,
  },
};

const fetcherBefore = {
  ...fetcher,
  kind: '@FETCHER/BEFORE',
};

const fetcherSuccess = {
  ...fetcher,
  kind: '@FETCHER/SUCCESS',
};

const fetcherFailure = {
  ...fetcher,
  kind: '@FETCHER/FAILURE',
};

const fetcherAbort = {
  kind: '@FETCHER/ABORT',
  name: request.name,
};

const fetcherAfter = {
  ...fetcher,
  kind: '@FETCHER/AFTER',
};

test('fetcher does run requests without triggers', async () => {
  await run<FetcherState>(
    {
      url: request.url,
      method: request.method,
    },
    successResponse,
    [fetcherBefore, fetcherSuccess, fetcherAfter],
  );
});

test('fetcher does abort open requests', async () => {
  const successMock = jest.fn(success);

  await run<FetcherState>(
    {
      ...request,
      triggers: {
        before: () => abort('foo'),
        success: successMock,
      },
    },
    successResponse,
    [fetcherBefore, fetcherAbort, fetcherAfter],
  );

  expect(successMock).toHaveBeenCalledTimes(0);
});

test('fetcher does not abort on unknown names', async () => {
  await run<FetcherState>(
    {
      ...request,
      triggers: {
        before: () => abort('bar'),
        success,
      },
    },
    successResponse,
    [fetcherBefore, fetcherSuccess, fooSuccess, fetcherAfter],
  );
});

test('fetcher run all life cycle triggers', async () => {
  const triggers = {
    before,
    after,
  };

  await run<FetcherState>(
    {
      ...request,
      triggers: {
        ...triggers,
        success,
      },
    },
    successResponse,
    [fetcherBefore, fooBefore, fetcherSuccess, fooSuccess, fooAfter, fetcherAfter],
  );

  await run<FetcherState>(
    {
      ...request,
      triggers: {
        ...triggers,
        failure,
      },
    },

    failureResponse,
    [fetcherBefore, fooBefore, fetcherFailure, fooFailure, fooAfter, fetcherAfter],
  );
});

test('fetcher run all life cycle tasks', async () => {
  await run<FetcherState>(request, successResponse, [fetcherBefore, fetcherSuccess, fetcherAfter]);
  await run<FetcherState>(request, failureResponse, [fetcherBefore, fetcherFailure, fetcherAfter]);
});
