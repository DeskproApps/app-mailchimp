import React from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import { Layout } from '@deskproapps/deskproapps-sdk-react';

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
      <Layout.Section title="CAMPAIGNS">
        <Layout.Block>
          No recorded campaign activity yet
        </Layout.Block>
      </Layout.Section>
    );
  };

  renderNormalState = () => {

    const { activityList } = this.props;

    return (
      <Layout.Section title="CAMPAIGNS">
        <Layout.Block>
          <div className="campaign-activity-list">
            <Scrollbars renderThumbVertical={renderScrollbarThumb} autoHeightMax={400} autoHeight={true} autoHideTimeout={500}>
              <div className="ui list">
                { activityList.map(this.mapStatusToMarkup) }
              </div>

            </Scrollbars>
          </div>
        </Layout.Block>
      </Layout.Section>
    );

  };

  render() {
    const { uiState } = this.state;

    if (uiState === 'empty') { return this.renderEmptyState(); }
    if (uiState === 'normal') { return this.renderNormalState(); }

    return (<noscript/>);
  }

}