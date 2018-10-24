
export class MembershipDetails
{
  /**
   * @param id
   * @param listName
   * @param {('subscribed'|'unsubscribed'|'cleaned'|'pending'|'transaction'|'not-a-member')} subscriberStatus
   */
  constructor({ id, listName, subscriberStatus })
  {
    this.props = { id, listName, subscriberStatus };
  }

  get id() { return this.props.id; }

  get listId() { return this.props.id; }

  get listName() { return this.props.listName; }

  get subscriberStatus() { return this.props.subscriberStatus; }

  isSubscribed = () => this.subscriberStatus === 'subscribed';

  isMember = () => this.props.subscriberStatus !== 'not-a-member';

  /**
   * @return {MembershipDetails}
   */
  toggleIsSubscribed = () => {
    const subscriberStatus = this.props.subscriberStatus === 'subscribed' ? 'unsubscribed' : 'subscribed';
    return new MembershipDetails({ ...this.props, subscriberStatus })
  };
}