
export class SubscriptionStatus
{
  constructor({ id, name, isSubscribed })
  {
    this.props = { id, name, isSubscribed };
  }

  get id() { return this.props.id; }

  get name() { return this.props.name; }

  get isSubscribed() { return this.props.isSubscribed; }
}