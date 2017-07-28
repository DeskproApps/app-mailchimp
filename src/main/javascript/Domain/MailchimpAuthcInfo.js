function b64EncodeUnicode(str) {
  // first we use encodeURIComponent to get percent-encoded UTF-8,
  // then we convert the percent encodings into raw bytes which
  // can be fed into btoa.
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
    function toSolidBytes(match, p1) {
      return String.fromCharCode('0x' + p1);
    }));
}

export class MailchimpAuthcInfo
{
  /**
   * @param {{access_token, refresh_token, expires, expires_in, resource_owner_id}} oauthToken
   * @param {String} apiKey
   */
  constructor({ oauthToken, apiKey })
  {
    this.props = { oauth2Token: oauthToken, apiKey };
  }

  get apiToken()
  {
    const { apiKey, oauthAccessToken } = this;
    if (apiKey) {
      return 'Basic ' + b64EncodeUnicode('anystring' + ":" + this.props.key)
    }

    if (oauthAccessToken) {
      return 'OAuth ' + oauthAccessToken;
    }

    return null;
  }

  get oauthAccessToken() {
    const { oauth2Token } = this.props;
    if (oauth2Token) {
      return oauth2Token.access_token
    }
    return null;
  }

  get oauthToken() { return this.props.oauth2Token; }

  get apiKey() { return this.props.apiKey; }

  toJS = () => JSON.parse(JSON.stringify(this.props));
}