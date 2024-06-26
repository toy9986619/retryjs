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
  - `recoverInterval`: `Number` - The interval time between each retry, default is `3000` ms. Please notice that the retry flow will not execute when the previous retry is not finished.

#### Return

- `promise`: `Promise` - The promise object. The promise will be resolved with the result of the async process function.
