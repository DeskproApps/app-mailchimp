
export class MailchimpAuthcInfo
{
  constructor({ oauth2Token, apiKey })
  {
    this.props = { oauth2Token, apiKey };
  }

  get oauth2Token() { return this.props.oauth2Token; }

  get apiKey() { return this.props.apiKey; }

  merge = other => Object.assign({}, this.props, other.props);

  toJS = () => Object.assign({}, this.props);
}