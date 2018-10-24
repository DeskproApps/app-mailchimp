function b64EncodeUnicode(str) {
  // first we use encodeURIComponent to get percent-encoded UTF-8,
  // then we convert the percent encodings into raw bytes which
  // can be fed into btoa.
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
    function toSolidBytes(match, p1) {
      return String.fromCharCode('0x' + p1);
    }));
}

export class ApiCredentials
{
  static get ACCESS_APIKEY() { return 'api-key'; }

  static get ACCESS_OAUTH() { return 'oauth'; }

  /**
   * @param {String} accessType
   * @param {String} accessToken
   */
  constructor({ accessType, accessToken })
  {
    this.props = { accessType, accessToken }
  }

  get accessType() { return this.props.accessType; }

  get accessToken() { return this.props.accessToken; }

  /**
   * @return {string}
   */
  encode = () => {
    if (this.accessType === ApiCredentials.ACCESS_APIKEY) {
      return 'Basic ' + b64EncodeUnicode(`anystring:${this.accessToken}`)
    }

    return 'OAuth ' + this.accessToken;
  };
}

export class MailchimpAuthcInfo
{
  /**
   * @param {String} oauth2Token
   * @param {String} apiKey
   * @return {MailchimpAuthcInfo}
   */
  static fromJS({apiKey})
  {
    const props = { apiKey, oauth2Token: '{{oauth:mailchimp:access_token}}' };
    return new MailchimpAuthcInfo(props);
  }

  /**
   * @param {{access_token, refresh_token, expires, expires_in, resource_owner_id}} oauth2Token
   * @param {String} apiKey
   */
  constructor({ oauth2Token, apiKey })
  {
    this.props = { oauth2Token, apiKey };
  }

  /**
   * @return {ApiCredentials|null}
   */
  get apiCredentials() {

    const { apiKey, oauth2Token } = this.props;
    let accessType, accessToken;

    if (apiKey) {
      accessType = ApiCredentials.ACCESS_APIKEY;
      accessToken = apiKey;
    } else if (oauth2Token) {
      accessType = ApiCredentials.ACCESS_OAUTH;
      accessToken = oauth2Token;
    }

    if (! accessType) {
      return null;
    }

    const props = { accessType, accessToken };
    return new ApiCredentials(props);
  }

  toJS = () => JSON.parse(JSON.stringify(this.props));
}
