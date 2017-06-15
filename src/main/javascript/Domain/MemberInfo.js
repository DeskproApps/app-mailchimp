export class MemberInfo
{
  constructor ({ email, fullName, rating })
  {
    this.props = { email, fullName, rating };
  }

  get email() { return this.props.email; }

  get fullName() { return this.props.fullName; }

  get rating() { return this.props.rating; }
}
