
export class CampaignActivity
{
  constructor({ subjectLine, status, date })
  {
    this.props = { subjectLine, status, date };
  }

  get subjectLine() { return this.props.subjectLine; }

  get status() { return this.props.status; }

  get date() { return this.props.date; }
}