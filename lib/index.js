export const subscribeRecovery = (processCallback = () => { }, recoverCheck = () => true, recoverOptions = {}) => {
  const { recoverLimit = 3, recoverInterval = 3000 } = recoverOptions;

  let recoverCount = 0;
  let intervalId;

  const promise = new Promise((resolve, reject) => {
    let executeLock = false;
    const recoverFlow = async () => {
      if (executeLock) return;

      executeLock = true;
      recoverCount += 1;

      try {
        const result = await processCallback();
        resolve(result);
      } catch (error) {
        let rejectValue;
        const rejectWithValue = (value) => {
          rejectValue = value;
          return value;
        };
        const recoverCheckParams = { isRecovering: true, rejectWithValue };

        if (recoverCount >= recoverLimit) {
          reject(error);
        }

        let needRecover = false;
        try {
          needRecover = recoverCheck(error, recoverCheckParams);
        } catch (recoverCheckError) {
          rejectValue = recoverCheckError;
        }

        if (!isUndefined(rejectValue)) {
          reject(rejectValue);
        } else if (!needRecover) {
          reject(error);
        }
      } finally {
        executeLock = false;
      }
    };

    intervalId = setInterval(() => {
      if (!executeLock) {
        recoverFlow();
      }
    }, recoverInterval);
  });

  const finalPromise = promise.finally(() => {
    clearInterval(intervalId);
  });

  return finalPromise;
};

export const processAndRecover = async (
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
