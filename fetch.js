/* eslint-disable semi */
/**
 * load url to a string
 * @param {String} url
 * @param {String} encoding
 * @returns {String}
 */
async function loadUrl(url, encoding = 'UTF-8') {
  const readBlobAsText = (blob) => new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => {
      resolve(fr.result);
    };

    fr.onerror = (err) => {
      reject(err);
    };

    fr.readAsText(blob, encoding);
  })
  const resp = await fetch(url)
  const blob = await resp.blob()
  const text = await readBlobAsText(blob, encoding)
  return text
}

/**
 * load url to a string then transform to  jQuery node
 * @param {String} url
 * @param {String} encoding
 */
async function loadUrlToJQNodes(url, encoding = 'UTF-8') {
  const text = await loadUrl(url, encoding)
  const $ = window.jQuery
  const ownerDocument = document.implementation.createHTMLDocument('virtual');
  return $($.trim(text), ownerDocument)
}
