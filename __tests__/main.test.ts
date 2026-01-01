import { jest, describe, expect } from '@jest/globals';
import PromiseThrottler from '../src/main';

/**
 * Creates a new PromiseThrottler instance with the specified requests per second.
 */
function createPromiseThrottler(rps: number, runSequentially?: boolean): PromiseThrottler {
  return new PromiseThrottler({
    requestsPerSecond: rps,
    promiseImplementation: Promise,
    runSequentially
  });
}

describe('PromiseThrottler', () => {
  jest.setTimeout(10000);

  it('should use native Promise when promiseImplementation is not provided', () => {
    const pt = new PromiseThrottler({
      requestsPerSecond: 1
    });

    expect(pt.promiseImplementation).toBe(global.Promise);
  });

  it('should have the following API: add(), addAll()', () => {
    expect(typeof PromiseThrottler.prototype.add).toBe('function');
    expect(typeof PromiseThrottler.prototype.addAll).toBe('function');
  });

  [false, true].forEach(runSequentially => {
    describe(`runSequentially: ${runSequentially}`, () => {
      describe('#add(fn)', () => {
        it('should return a promise', () => {
          const pt10 = createPromiseThrottler(10, runSequentially);

          const fn = (): Promise<void> => {
            return Promise.resolve();
          };

          return expect(pt10.add(fn)).resolves.toBeUndefined();
        });

        it('should be resolved with the resolved value of the promise returned by the function', () => {
          const pt10 = createPromiseThrottler(10, runSequentially);

          const fn = (): Promise<number> => {
            return Promise.resolve(42);
          };

          return expect(pt10.add(fn)).resolves.toBe(42);
        });

        it('should be rejected with the rejected error of the promise returned by the function', () => {
          const pt10 = createPromiseThrottler(10, runSequentially);

          const fnError = new Error('Ooops!');
          const fn = (): Promise<never> => {
            return Promise.reject(fnError);
          };

          return expect(pt10.add(fn)).rejects.toBe(fnError);
        });

        it('should be rejected with the error thrown by the function', () => {
          const pt10 = createPromiseThrottler(10, runSequentially);

          const fnError = new Error('Ooops!');
          const fn = (): Promise<never> => {
            throw fnError;
          };

          return expect(pt10.add(fn)).rejects.toBe(fnError);
        });
      });

      describe('#addAll([fn1, fn2, ...])', () => {
        it('should add all the functions passed as parameters', () => {
          const pt10 = createPromiseThrottler(10, runSequentially);

          const fn1 = (): Promise<void> => Promise.resolve();
          const fn2 = (): Promise<void> => Promise.resolve();

          jest.spyOn(pt10, 'add');

          pt10.addAll([fn1, fn2]);

          expect(pt10.add).toHaveBeenCalledWith(fn1, runSequentially ? true : false);
          expect(pt10.add).toHaveBeenCalledWith(fn2, true);
        });

        it('should return a promise that is resolved with the proper values', () => {
          const pt10 = createPromiseThrottler(10, runSequentially);

          const fn1 = (): Promise<number> => {
            return Promise.resolve(12);
          };
          const fn2 = (): Promise<number> => {
            return Promise.resolve(34);
          };

          return pt10.addAll([fn1, fn2])
            .then((values: number[]) => {
              expect(values[0]).toBe(12);
              expect(values[1]).toBe(34);
            });
        });

        it('should return a promise that is rejected whenever one of the function rejects its promise', () => {
          const pt10 = createPromiseThrottler(10, runSequentially);

          const fn1 = (): Promise<number> => {
            return Promise.resolve(12);
          };
          const fnError = new Error('Ooops!');
          const fn2 = (): Promise<Error> => {
            return Promise.resolve(fnError);
          };

          return pt10.addAll<number | Error>([fn1, fn2])
            .then((values: (number | Error)[]) => {
              expect(values[0]).toBe(12);
              expect(values[1]).toBe(fnError);
            });
        });

        it('respect-the-requestsPerSecond-option', (done) => {
          const pt2 = createPromiseThrottler(2, runSequentially);

          let count = 8;
          const fns: (() => Promise<void>)[] = [];
          let resolvedCount = 0;
          const resolved: number[] = [];
          const fn = (): Promise<void> => {
            resolvedCount++;
            return Promise.resolve();
          };

          while (count-- > 0) {
            fns.push(fn);
          }

          pt2.addAll(fns);

          // 2 resolved at 1s
          setTimeout(() => {
            resolved.push(resolvedCount);
          }, 700);

           // 4 resolved at 2s
          setTimeout(() => {
            resolved.push(resolvedCount);
          }, 1700);

           // 6 resolved at 3s
          setTimeout(() => {
            resolved.push(resolvedCount);
          }, 2700);

           // 8 resolved at 4s
          setTimeout(() => {
            resolved.push(resolvedCount);
            expect(resolved).toEqual([2, 4, 6, 8]);
            done();
          }, 3700);
        });
      });
    });
  });

  describe('requestsPerSecond < 1 handling in paralled execution', () => {
    it('should handle requestsPerSecond < 1 in parallel execution', (done) => {
      const pt = createPromiseThrottler(0.5, false);
      let resolvedCount = 0;
      
      const fn = (): Promise<void> => {
        resolvedCount++;
        return Promise.resolve();
      };
      
      pt.addAll([fn, fn]);
      
      setTimeout(() => {
        expect(resolvedCount).toBe(1);
        done();
      }, 1500);
    });
  });
});