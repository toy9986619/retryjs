import { processAndRecover, RETRY_STRATEGY } from '../lib/index.js';

describe('processAndRecover with interval strategy', () => {
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

  it('process failed, recover failed, recover check failed test', async () => {
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

describe('processAndRecover with timeout strategy', () => {
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
    }, () => true, { strategy: RETRY_STRATEGY.TIMEOUT });
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
    }, () => true, { strategy: RETRY_STRATEGY.TIMEOUT });
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
      }, () => false, { strategy: RETRY_STRATEGY.TIMEOUT });
      await flowPromise;
    } catch (error) {
      expect(error.message).toBe('test failed');
    }
  });

  it('process failed, recover failed, recover check failed test', async () => {
    try {
      const flowPromise = processAndRecover(async () => {
        throw new Error('test failed');
      }, (error, { isRecovering }) => {
        if (isRecovering) {
          return false;
        }

        return true;
      }, { strategy: RETRY_STRATEGY.TIMEOUT });
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
      }, { strategy: RETRY_STRATEGY.TIMEOUT });
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
      }, { strategy: RETRY_STRATEGY.TIMEOUT });
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
      }, { strategy: RETRY_STRATEGY.TIMEOUT });
      await flowPromise;
    } catch (error) {
      expect(error.message).toBe('first time recover check failed');
    }
  });

  it('process failed, recover all failed test', async () => {
    try {
      const flowPromise = processAndRecover(async () => {
        throw new Error('test failed');
      }, () => true, { recoverLimit: 1, strategy: RETRY_STRATEGY.TIMEOUT });
      await flowPromise;
    } catch (error) {
      expect(error.message).toBe('test failed');
    }
  });

  it('process failed, recover success, timeoutFactor test', async () => {
    let isExecuted = false;

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
      if (count <= 1) {
        count += 1;
        throw new Error('test failed');
      }

      const result = await mockFunc();
      return result;
    }, () => true, { strategy: RETRY_STRATEGY.TIMEOUT, timeoutFactor: 2 });
    flowPromise.then(() => {
      isExecuted = true;
    });

    await new Promise((resolve) => setTimeout(resolve, 1000));

    expect(isExecuted).toBe(false);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    expect(isExecuted).toBe(false);

    await new Promise((resolve) => setTimeout(resolve, 4000));

    expect(isExecuted).toBe(true);

    const result = await flowPromise;
    expect(result).toBe('test');
  }, 10000);
});

describe('timeout counter test', () => {
  it('factor test', async () => {
    const startTimeout = 1000;
    const maxTimeout = 10000;
    const timeoutFactor = 2;

    const getTimeout = (recoverCount) => Math.min(startTimeout * Math.pow(timeoutFactor, recoverCount), maxTimeout);

    expect(getTimeout(0)).toBe(1000);
    expect(getTimeout(1)).toBe(2000);
    expect(getTimeout(2)).toBe(4000);
    expect(getTimeout(3)).toBe(8000);
    expect(getTimeout(4)).toBe(10000);
    expect(getTimeout(5)).toBe(10000);
  })
});
