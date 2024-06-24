import { processAndRecover } from '../lib/index';

describe('processAndRecover', () => {
  it('process success test', async () => {
    const mockFunc = () => {
      const testPromise = new Promise((resolve) => {
        setTimeout(() => {
          resolve('test');
        }, 1000);
      });

      return testPromise;
    };

    const flowPromise = processAndRecover(async () => {
      const result = await mockFunc();
      return result;
    });
    const result = await flowPromise;
    expect(result).toBe('test');
  });

  it('process failed, recover success test', async () => {
    const mockFunc = () => {
      const testPromise = new Promise((resolve) => {
        setTimeout(() => {
          resolve('test');
        }, 1000);
      });

      return testPromise;
    };

    let count = 0;

    const flowPromise = processAndRecover(async () => {
      if (count === 0) {
        count += 1;
        throw new Error('test failed');
      }

      const result = await mockFunc();
      return result;
    });
    const result = await flowPromise;
    expect(result).toBe('test');
  });

  it('process failed, recover check failed test, not start recover flow', async () => {
    const mockFunc = () => {
      const testPromise = new Promise((resolve) => {
        setTimeout(() => {
          resolve('test');
        }, 1000);
      });

      return testPromise;
    };

    let count = 0;

    try {
      const flowPromise = processAndRecover(async () => {
        if (count === 0) {
          count += 1;
          throw new Error('test failed');
        }

        const result = await mockFunc();
        return result;
      }, () => false);
      await flowPromise;
    } catch (error) {
      expect(error.message).toBe('test failed');
    }
  });

  it('process failed, recover failed, recover check failedtest', async () => {
    try {
      const flowPromise = processAndRecover(async () => {
        throw new Error('test failed');
      }, (error, { isRecovering }) => {
        if (isRecovering) {
          return false;
        }

        return true;
      });
      await flowPromise;
    } catch (error) {
      expect(error.message).toBe('test failed');
    }
  });

  it('process failed, recover failed, recover check failed, reject with value test', async () => {
    try {
      const flowPromise = processAndRecover(async () => {
        throw new Error('test failed');
      }, (error, { isRecovering, rejectWithValue }) => {
        if (isRecovering) {
          rejectWithValue(new Error('recover check failed'));
          return false;
        }

        return true;
      });
      await flowPromise;
    } catch (error) {
      expect(error.message).toBe('recover check failed');
    }
  });

  it('process failed, start recover flow, recover check throw error test', async () => {
    try {
      const flowPromise = processAndRecover(async () => {
        throw new Error('test failed');
      }, (error, { isRecovering }) => {
        if (isRecovering) {
          throw new Error('recover check failed');
        }
        return true;
      });
      await flowPromise;
    } catch (error) {
      expect(error.message).toBe('recover check failed');
    }
  });

  it('process failed, first time recover check, reject with value test', async () => {
    try {
      const flowPromise = processAndRecover(async () => {
        throw new Error('test failed');
      }, (error, { rejectWithValue }) => {
        rejectWithValue(new Error('first time recover check failed'));
      });
      await flowPromise;
    } catch (error) {
      expect(error.message).toBe('first time recover check failed');
    }
  });

  it('process failed, recover all failed test', async () => {
    try {
      const flowPromise = processAndRecover(async () => {
        throw new Error('test failed');
      }, () => true, { recoverLimit: 1, recoverInterval: 1000 });
      await flowPromise;
    } catch (error) {
      expect(error.message).toBe('test failed');
    }
  });
});
