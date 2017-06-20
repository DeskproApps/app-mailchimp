export class MemberInfo
{
  constructor ({ email, fullName, rating, vip })
  {
    this.props = { email, fullName, rating, vip };
  }

  get email() { return this.props.email; }

  get fullName() { return this.props.fullName; }

  get rating() { return this.props.rating || 0; }

  /**
   * @param email
   * @return {MemberInfo}
   */
  changeEmail = email => {
    const newProps = { ...this.props, email};
    return new MemberInfo(newProps);
  };

  /**
   * @param fullName
   * @return {MemberInfo}
   */
  changeFullName = fullName => {
    const newProps = { ...this.props, fullName};
    return new MemberInfo(newProps);
  };

  /**
   * @param rating
   * @return {MemberInfo}
   */
  changeRating = rating => {
    const newProps = { ...this.props, rating};
    return new MemberInfo(newProps);
  };

  /**
   * @param vip
   * @return {MemberInfo}
   */
  changeVIP = vip => {
    const newProps = { ...this.props, vip};
    return new MemberInfo(newProps);
  };
}
