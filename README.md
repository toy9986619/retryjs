# retry-js

A little Utils for JavaScript Retry Mechanism.
Work with async function and Promise pattern.

Support ES Module and CommonJS.

## Installation

```bash
npm install @raynorlin/retry-js
```

## Usage

### ES Module

```javascript
import { processAndRecover } from '@raynorlin/retry-js';

const flowPromise = processAndRecover(async () => {
  // Your async process function
  const result = await asyncProcess();
  return result;
}, (error, { isRecovering, rejectWithValue }) => {
  // handling error and check if need to retry
  // the error is thrown by the async process function

  // if need to retry, return true
  if (needToRetry) {
    return true;
  }

  if (isRecovering) {
    // if your want to check this error is first time execute or is in recover flow
  }

  // if don't need to retry, return false
  // also you can reject the promise with your special value
  rejectWithValue({ message: 'not retry' });
  return false;
});

try {
  const result = await flowPromise;
} catch (error) {
  // handle error when retry failed

  console.log(error);  // will be { message: 'not retry' } if execute rejectWithValue, or the final error thrown by async process function
}
```

### Common JS

```javascript
const { processAndRecover } = require('@raynorlin/retry-js');

// same use as ES Module
```

## Retry Strategy

### Interval

The retry mechanism will set am interval timer and execute the async process function with a fixed interval time.
When the previous retry is not finished, the next retry will not execute.

```javascript
const promise = processAndRecover(callback, recoverCheck, {
  recoverLimit: 3,
  strategy: 'interval',
  recoverInterval: 3000,
});
```

### Timeout

The retry mechanism will set a timeout timer for the retry to execute the async process function, and increase the timeout with a factor when the previous retry is failed.
When the previous retry is not finished, the next retry timer will not to be set.

```javascript
const promise = processAndRecover(callback, recoverCheck, {
  recoverLimit: 3,
  strategy: 'timeout',
  startTimeout: 1000,
  maxTimeout: 10000,
  timeoutFactor: 2,
});
```

## API

### processAndRecover

```javascript
const promise = processAndRecover(callback, recoverCheck, recoverOptions);
```

- `callback`: `Function` - The async process function.
- `recoverCheck`: `Function` - The function to check if need to retry when the error happen.
  - `isRecovering`: `Boolean` - The flag to check if the error is in recover flow.
  - `rejectWithValue`: `Function` - The function to reject the promise with special value.
- `recoverOptions`: `Object` - The options for retry mechanism.
  - `recoverLimit`: `Number` - The max retry times, default is `3`.
  - `strategy`: `String` - The retry strategy, default is `interval`. Support `interval` and `timeout`.
  - `recoverInterval`: `Number` - Only support when strategy is `interval`. The interval time between each retry, default is `3000` ms. Please notice that the retry flow will not execute when the previous retry is not finished.
  - `startTimeout`: `Number` - Only support when strategy is `timeout`. The timeout for the first retry, default is `1000` ms.
  - `maxTimeout`: `Number` - Only support when strategy is `timeout`. The max timeout for the retry, default is `Infinity` ms.
  - `timeoutFactor`: `Number` - Only support when strategy is `timeout`. The factor to increase the timeout, default is `2`.

#### Return

- `promise`: `Promise` - The promise object. The promise will be resolved with the result of the async process function.

## Constants

### RetryStrategy

```javascript
import { RETRY_STRATEGY } from '@raynorlin/retry-js';
```

- `RETRY_STRATEGY.INTERVAL`: `String` - The interval strategy.
- `RETRY_STRATEGY.TIMEOUT`: `String` - The timeout strategy.
