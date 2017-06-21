import { Client as BatchesClient } from './Batches'

function b64EncodeUnicode(str) {
  // first we use encodeURIComponent to get percent-encoded UTF-8,
  // then we convert the percent encodings into raw bytes which
  // can be fed into btoa.
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
    function toSolidBytes(match, p1) {
      return String.fromCharCode('0x' + p1);
    }));
}

export class FetchClient
{
  /**
   * Constructor function
   *
   * @param key
   * @param location
   * @param debug
   * @param {function} fetch a Fetch implementation
   */
  constructor({ key, location, debug , fetch})
  {
    /**
     * Report error when key is not set, otherwise set key to this.key
     */
    if(typeof key === 'undefined'){
      console.warn('WARN: Key is undefined, add your API KEY');
    }

    let defaultLocation = 'us12';
    let keyLocation;
    if (!location && key) {
      const keyParts = key.match(/^([^-]+)-([^-]+)$/i);
      if (keyParts && keyParts.length >= 3) {
        keyLocation = keyParts[2];
      }
    }

    const apiHost = (location || keyLocation || defaultLocation) + '.api.mailchimp.com';
    this.props = { key, apiHost, debug, fetch };
  }

  get batches() { return new BatchesClient({fetchClient: this}); }

  /**
   * @param {String} endpoint
   * @param {{}} init
   * @return {*}
   */
  fetch (endpoint, init) {
    const headersOverride = {
      'Content-Type': 'application/json' ,
      'Authorization': 'Basic ' + b64EncodeUnicode('anystring' + ":" + this.props.key),
    };

    const urlPrefix = 'https://' + this.props.apiHost + '/3.0';
    const url = endpoint.toString().startsWith(urlPrefix) ? endpoint : urlPrefix + endpoint;

    let { body } = init;
    if (typeof body !== 'undefined' ) {
      headersOverride['Content-Length'] = typeof body !== 'string' ? JSON.stringify(body).length : body.length;
    }

    const initOverride = typeof body === 'string' ? {body, headers: headersOverride} : {headers: headersOverride};
    return this.props.fetch(url, {...init, ...initOverride});
  }
}