export class List
{
  constructor ({ id, webId, name })
  {
    this.props = { id, webId, name };
  }

  get id() { return this.props.id; }

  get webId() { return this.props.webId; }

  get name() { return this.props.name; }
}

export class ListMember
{
  /**
   * @param {String} email
   * @param {Number} rating
   * @param {Boolean} vip
   * @param {String} id
   * @param {String} listId
   * @param {('subscribed'|'unsubscribed'|'cleaned'|'pending'|'transaction')} listStatus
   * @see http://developer.mailchimp.com/documentation/mailchimp/reference/lists/members/#edit-put_lists_list_id_members_subscriber_hash
   */
  constructor ({ email, rating, vip, id, listId, listStatus })
  {
    this.props = { email, rating, vip, id, listId, listStatus };
  }

  isSubscribed = () => this.props.listStatus === 'subscribed';

  get id() { return this.props.id; }

  get email() { return this.props.email; }

  get rating() { return this.props.rating; }

  get vip() { return this.props.vip; }

  get listId() { return this.props.listId; }

  get listStatus() { return this.props.listStatus; }
}

