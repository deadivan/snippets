/* eslint-disable semi */
async function sleep(ms) {
  return new Promise((resolve) => setTimeout(() => resolve(null), ms))
}

/**
 * Sequential execute async function
 * @param {Array of Fuction} funcs async functions
 */
const serial = (funcs) => funcs.reduce((promise, func) => promise.then(
  (result) => func().then(Array.prototype.concat.bind(result)),
), Promise.resolve([]));

/**
 * Call function interval until it returns true or exceed retry count
 * @param {Fuction} func function that return true to finish trying
 * @param {Number} interval inteval time
 * @param {Number} retryCount retry count
 * @param {String} reason reject reason
 */
async function insist(func, interval = 1000, retryCount = 3, reason = '') {
  let cnt = 0;
  return new Promise((resolve, reject) => {
    const fn = () => setTimeout(() => {
      const val = func();
      if (val) resolve(true);
      else {
        cnt++;
        if (cnt < retryCount) fn();
        else {
          reject(reason);
        }
      }
    }, interval)
    fn();
  })
}

/**
 * call async function until it returns true or exceed retry count
 * @param {Function} func async function
 * @param {Number} retryCount retry count
 * @param {String} debug debug string
 * @returns {*} return func's return value or null
 */
async function insistE(func, retryCount = 3, debug = null) {
  let ret
  let lastError
  for (let i = 0; i < retryCount; i++) {
    try {
      console.log(`phase ${i}`)
      if (i > 0 && debug) console.log(debug)
      ret = await func()
      return ret;
    } catch (e) {
      lastError = e
  
    }
  } 
  console.log(func.name + ' failed!' + JSON.stringify(lastError))
  return null
}

/**
 * create a iframe
 * @param {String} frameId open a iframe for loading page
 */
// eslint-disable-next-line no-underscore-dangle
const _openWin = (frameId = 'snippet-frame') => {
  const $ = window.jQuery
  let $frame = $(`#${frameId}`)
  if ($frame.length === 0) {
    $frame = $(`<iframe id="${frameId}" name="${frameId}"></iframe>`)
    $frame.appendTo($('body'));
  }
  const x = $frame[0].contentWindow
  x.location.assign('about:blank')
  return x
}
/**
 * load url to an iframe
 * @param {String} url url to open
 * @param {String} frameId iframe id
 * @param {Function} testFunc test function return true if window finish loading url
 * @returns {Object} window object of iframe
 */
const openWin = async (url, frameId = 'snippet-frame', testFunc = null) => {
  const PAGE_TIME_OUT = window.PAGE_TIME_OUT || 20
  const x = _openWin(frameId)
  await sleep(100)
  x.location.assign(url)
  await insist(
    () => x.location.href !== 'about:blank' && x.document.readyState !== 'loading',
    PAGE_TIME_OUT,
    100,
    `url load eror ${url}`,
  )
  if (testFunc) await insist(() => testFunc(x), 500, 100, `url test function eror ${url}`);
  return x
}
