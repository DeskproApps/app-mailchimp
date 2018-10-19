
export class MemberActivity
{
  /**
   * @param {String} campaignTitle
   * @param {String} status
   * @param {String} date
   * @param {String} campaignId
   * @param {String} bounceType
   */
  constructor({ campaignTitle, status, date, campaignId, bounceType })
  {
    this.props = { campaignTitle, status, date, campaignId, bounceType };
  }

  /**
   * @return {String}
   */
  get campaignId() { return this.props.campaignId; }

  /**
   * @return {String}
   */
  get campaignTitle() { return this.props.campaignTitle; }

  /**
   * @return {String}
   */
  get status() { return this.props.status; }

  /**
   * @return {String}
   */
  get bounceType() { return this.props.bounceType; }

  /**
   * @return {String}
   */
  get date() { return this.props.date; }
}
