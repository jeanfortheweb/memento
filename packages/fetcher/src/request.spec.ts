import { run, FetcherState } from './test/utils';
import { KIND_BEFORE, KIND_SUCCESS, KIND_FAILURE, KIND_AFTER } from './request';

const request = {
  url: 'http://api.foo.com/get/123',
  method: 'GET',
};

const failureResponse = {
  status: 500,
};

const successResponse = {
  status: 200,
};

const fetcher = {
  payload: {
    request: {
      url: request.url,
    },
  },
};

const fetcherBefore = {
  ...fetcher,
  kind: KIND_BEFORE,
};

const fetcherSuccess = {
  ...fetcher,
  kind: KIND_SUCCESS,
};

const fetcherFailure = {
  ...fetcher,
  kind: KIND_FAILURE,
};

const fetcherAfter = {
  ...fetcher,
  kind: KIND_AFTER,
};

test('runs all life cycle tasks', async () => {
  await run<FetcherState>(request, successResponse, [fetcherBefore, fetcherSuccess, fetcherAfter]);
  await run<FetcherState>(request, failureResponse, [fetcherBefore, fetcherFailure, fetcherAfter]);
});

test('does abort open requests', async () => {
  await run<FetcherState>(
    {
      ...request,
      name: 'foo',
    },
    successResponse,
    [fetcherBefore, fetcherAfter],
    true,
  );
});

test('does not abort on unknown names', async () => {
  await run<FetcherState>(
    {
      ...request,
      name: 'bar',
      tags: ['foo', 'bar'],
    },
    successResponse,
    [fetcherBefore, fetcherSuccess, fetcherAfter],
    true,
  );
});
