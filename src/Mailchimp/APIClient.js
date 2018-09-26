import { Client as BatchesClient } from './Batches'
import { ApiCredentials } from './Authentication'
import { AuthenticationError } from './Errors'

const parseApiHostFromApiKey = (apiKey, { useFallback }) =>
{
  let keyHost;

  if (typeof apiKey === 'string') {
    const keyParts = apiKey.match(/^([^-]+)-([^-]+)$/i);
    if (keyParts && keyParts.length >= 3) {
      keyHost = keyParts[2] + '.api.mailchimp.com';
    }
  }

  if (keyHost) {
    return keyHost;
  }

  if (useFallback) {
    return 'us12.api.mailchimp.com';
  }

  return null;
};

export class FetchClient
{
  /**
   * @param {ApiCredentials} credentials
   * @param {function} fetch
   *
   * @return Promise.<FetchClient>
   */
  static withOauthAccess({credentials, fetch})
  {
    const apiToken = credentials.encode();

    const fetchParams = {
      method: "GET",
      headers: {
        'Content-Type': 'application/json' ,
        'Accept': 'application/json' ,
        'Authorization':  apiToken
      }
    };

    return fetch('https://login.mailchimp.com/oauth2/metadata', fetchParams)
      .catch(err => Promise.reject(new AuthenticationError('api access denied', err)))
      .then(response => { return response.body; })
      .then(({ dc, login_url, api_endpoint }) => {
        const apiHost = dc + '.api.mailchimp.com';
        return new FetchClient({ apiToken, apiHost, fetch });
      })
    ;
  }

  /**
   * @param {ApiCredentials} credentials
   * @param {function} fetch
   *
   * @return Promise.<FetchClient>
   */
  static withApiKeyAccess({credentials, fetch})
  {
    const apiToken = credentials.encode();
    const { accessToken: apiKey } = credentials;

    const apiHost = parseApiHostFromApiKey(apiKey, { useFallback: false });
    if (apiHost) {
      return Promise.resolve(new FetchClient({ apiToken, apiHost, fetch }));
    }
    return Promise.reject(new Error('could not extract api host from api key'));
  }

  /**
   * @param {MailchimpAuthcInfo} mailchimpAuth
   * @param {function} fetch a Fetch implementation
   *
   * @return Promise
   */
  static fromAuthc(mailchimpAuth, fetch)
  {
    const credentials = mailchimpAuth.apiCredentials;

    if (! credentials) {
      return Promise.reject(new Error('no authentication credentials available'));
    }

    if (credentials.accessType === ApiCredentials.ACCESS_APIKEY) {
      return FetchClient.withApiKeyAccess({credentials, fetch});
    }

    if (credentials.accessType === ApiCredentials.ACCESS_OAUTH) {
      return FetchClient.withOauthAccess({credentials, fetch});
    }

    return Promise.reject(new Error('no authentication credentials available'));
  }

  // https://login.mailchimp.com/oauth2/metadata
  /**
   * Constructor function
   *
   * @param apiToken
   * @param apiHost
   * @param debug
   * @param {function} fetch a Fetch implementation
   */
  constructor({ apiToken, apiHost, debug , fetch})
  {
    /**
     * Report error when key is not set, otherwise set key to this.key
     */
    if(typeof apiToken === 'undefined'){
      console.warn('WARN: Key is undefined, add your API KEY');
    }

    this.props = { apiToken, apiHost, debug, fetch };
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
      'Accept': 'application/json' ,
      'Authorization':  this.props.apiToken,
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
