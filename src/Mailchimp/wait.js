export const wait = (fn, interval, stop, next) => delay(fn, interval).then(result => stop(result) ? result : next(result));

/**
 * @param {Promise} fn
 * @param {function} resolve
 * @param {function} reject
 */
const deferr = (fn, resolve, reject) => () => fn().then(resolve, reject);

/**
 * @param {Promise} fn
 * @param interval
 * @return {Promise}
 */
const delay = (fn, interval) => {
  const executor = (resolve, reject) => {
    const deferred = deferr(fn, resolve, reject);
    setTimeout(deferred, interval);
  };
  return new Promise(executor);
};