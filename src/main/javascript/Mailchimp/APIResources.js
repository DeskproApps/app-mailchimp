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
  constructor ({ email, rating, vip, listId })
  {
    this.props = { email, rating, vip, listId };
  }

  get email() { return this.props.email; }

  get rating() { return this.props.rating; }

  get vip() { return this.props.vip; }

  get listId() { return this.props.listId; }
}

