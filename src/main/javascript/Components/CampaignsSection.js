import React from 'react';
import { Container, Section, Heading, Scrollbar } from '@deskpro/react-components';

const renderScrollbarThumb = ({ style, ...props }) => {
  const thumbStyle = {
    backgroundColor: "#cccccc",
    zIndex:400
  };
  return (
    <div
      style={{ ...style, ...thumbStyle }}
      {...props}/>
  );
};

export class MemberActivityList extends React.Component
{
  static propTypes = {
    activityList: React.PropTypes.array.isRequired
  };

  static defaultProps = {};

  constructor(props)
  {
    super(props);
    this.initState();
  }

  initState = () =>
  {
    const { activityList } = this.props;

    this.state = {
      uiState: activityList.length === 0 ? 'empty' : 'normal'
    };

  };

  componentWillReceiveProps(nextProps)
  {
    const uiState = nextProps.activityList.length === 0 ? 'empty' : 'normal';

    if (uiState !== this.state.uiState) {
      this.setState({ uiState });
    }
  }

  /**
   * @param {MemberActivity} status
   */
  mapStatusToMarkup = status =>
  {
    return (

      <div className="item">
        <div className="header">{status.campaignTitle}</div>
        <div className="description text small"><span>{status.date}</span> <span>|</span> <span>{status.status}</span></div>
      </div>
    );
  };

  renderEmptyState = () => {
    return (
      <Container>
        <Heading size={3}>
          Campaigns
        </Heading>
        <p>
          No recorded campaign activity yet
        </p>
      </Container>
    );
  };

  renderNormalState = () => {

    const { activityList } = this.props;

    return (
      <Container>
        <Heading size={3}>
          Campaigns
        </Heading>
        <div className="campaign-activity-list">
          <Scrollbar>
            <div className="ui list">
              { activityList.map(this.mapStatusToMarkup) }
            </div>
          </Scrollbar>
        </div>
      </Container>
    );
  };

  render() {
    switch (this.state.uiState) {
      case 'empty':
        return this.renderEmptyState();
      case 'normal':
        return this.renderNormalState();
      default:
        return <noscript />;
    }
  }
}