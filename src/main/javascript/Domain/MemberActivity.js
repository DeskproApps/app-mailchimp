
export class MemberActivity
{
  /**
   * @param {String} subjectLine
   * @param {String} status
   * @param {String} date
   */
  constructor({ subjectLine, status, date })
  {
    this.props = { subjectLine, status, date };
  }

  /**
   * @return {String}
   */
  get subjectLine() { return this.props.subjectLine; }

  /**
   * @return {String}
   */
  get status() { return this.props.status; }

  /**
   * @return {String}
   */
  get date() { return this.props.date; }
}