const RETRY_STRATEGY = {
  INTERVAL: 'interval',
  TIMEOUT: 'timeout',
};

const subscribeRecovery = (processCallback = () => { }, recoverCheck = () => true, recoverOptions = {}) => {
  const {
    recoverLimit = 3,
    recoverInterval = 3000,
    strategy = RETRY_STRATEGY.INTERVAL,
    startTimeout = 1000,
    maxTimeout = Infinity,
    timeoutFactor = 2,
  } = recoverOptions;

  let recoverCount = 0;
  let intervalId;
  let timeoutId;

  const promise = new Promise((resolve, reject) => {
    let executeLock = false;
    const recoverFlow = async () => {
      if (executeLock) return;

      executeLock = true;
      recoverCount += 1;

      try {
        const result = await processCallback();
        resolve(result);
        return { isSuccess: true, result };
      } catch (error) {
        let rejectValue;
        const rejectWithValue = (value) => {
          rejectValue = value;
          return value;
        };
        const recoverCheckParams = { isRecovering: true, rejectWithValue };

        if (recoverCount >= recoverLimit) {
          reject(error);
          return { isSuccess: false, error, needRecover: false };
        }

        let needRecover = false;
        try {
          needRecover = recoverCheck(error, recoverCheckParams);
        } catch (recoverCheckError) {
          rejectValue = recoverCheckError;
        }

        if (rejectValue !== undefined) {
          reject(rejectValue);
          return { isSuccess: false, error: rejectValue, needRecover: false };
        } else if (!needRecover) {
          reject(error);
          return { isSuccess: false, error, needRecover: false };
        }

        return { isSuccess: false, error, needRecover: true };
      } finally {
        executeLock = false;
      }
    };

    if (strategy === RETRY_STRATEGY.TIMEOUT) {
      const subscribeRecoveryTimeout = () => {
        const currentTimeout = Math.min(startTimeout * Math.pow(timeoutFactor, recoverCount), maxTimeout);
        timeoutId = setTimeout(() => {
          recoverFlow().then(({ isSuccess, needRecover }) => {
            if (!isSuccess && needRecover) {
              subscribeRecoveryTimeout();
            }
          });
        }, currentTimeout);
      };

      subscribeRecoveryTimeout();
    } else if (strategy === RETRY_STRATEGY.INTERVAL) {
      intervalId = setInterval(() => {
        if (!executeLock) {
          recoverFlow();
        }
      }, recoverInterval);
    }
  });

  const finalPromise = promise.finally(() => {
    clearInterval(intervalId);
    clearTimeout(timeoutId);
  });

  return finalPromise;
};

const processAndRecover = async (
  callback = () => { },
  recoverCheck = () => true,
  recoverOptions = {},
) => {
  const promise = new Promise((resolve, reject) => {
    const processFlow = async () => {
      try {
        const result = await callback();
        resolve(result);
      } catch (error) {
        let rejectValue;
        const rejectWithValue = (value) => {
          rejectValue = value;
          return value;
        };
        const recoverCheckParams = { isRecovering: false, rejectWithValue };
        const needRecover = recoverCheck(error, recoverCheckParams);

        if (rejectValue !== undefined) {
          reject(rejectValue);
        } else if (needRecover) {
          try {
            const recoverPromiseResult = await subscribeRecovery(async () => {
              const callbackResult = await callback();
              return callbackResult;
            }, recoverCheck, recoverOptions);
            resolve(recoverPromiseResult);
          } catch (recoverError) {
            reject(recoverError);
          }
        } else {
          reject(error);
        }
      }
    };
    processFlow();
  });

  return promise;
};

export { RETRY_STRATEGY, processAndRecover };
