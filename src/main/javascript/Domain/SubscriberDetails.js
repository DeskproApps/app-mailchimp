/**
 * Unified profile of an email address
 */
export class SubscriberDetails
{
  /**
   * @param {String} subscriberHash
   * @param {String} email
   * @param {String} fullName
   * @param {number} rating
   * @param {boolean} vip
   */
  constructor ({ subscriberHash, email, fullName, rating, vip })
  {
    this.props = { subscriberHash, email, fullName, rating, vip: !!vip };
  }

  /**
   * @return {String}
   */
  get email() { return this.props.email; }

  /**
   * @return {String}
   */
  get subscriberHash() { return this.props.subscriberHash; }

  /**
   * @return {String}
   */
  get fullName() { return this.props.fullName; }

  /**
   * @return {number}
   */
  get rating() { return this.props.rating || 0; }

  /**
   * @return {boolean}
   */
  get vip() { return this.props.vip; }

  /**
   * @param {SubscriberDetails} other
   */
  merge = other =>
  {
    const js = other.toJS();

    const reducer = (acc, key) => {
      if (js[key] !== undefined) { acc[key] = js[key]; }
      return acc;
    };
    const mergeableJS = Object.keys(js).reduce(reducer, {});

    return new SubscriberDetails({ ...this.props, ...mergeableJS });
  };

  toJS = () => { return {... this.props}; };
}
