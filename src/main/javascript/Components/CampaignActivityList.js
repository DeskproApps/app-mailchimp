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

export class CampaignActivityList extends React.Component
{
  static propTypes = {
    activityList: React.PropTypes.array.isRequired
  };

  static defaultProps = {

  };

  constructor(props) {
    super(props);
    this.initState();
  }

  initState = () => {
    const { activityList } = this.props;

    this.state = {
      uiState: activityList.length === 0 ? 'empty' : 'normal'
    }
  };

  /**
   * @param {CampaignActivity} status
   */
  mapStatusToMarkup = status => {
    return (

      <div className="item">
        <div className="header">{status.subjectLine}</div>
        <div className="description text small"><span>{status.date}</span> <span>|</span> <span>{status.status}</span></div>
      </div>
    );
  };

  renderEmptyState = () => {
    return (
      <Layout.Section title="CAMPAIGNS">
        <Layout.Block>
          You have no campaigns
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

    return null;
  }

}

/**
 * @param {Array<CampaignActivity>} activityList
 * @constructor
 */
export const CampaignActivityLists = ({ activityList }) => {

  if (activityList.length === 0) {
    return (
      <Layout.Section title="CAMPAIGNS">
        <Layout.Block>
          You have no campaigns
        </Layout.Block>
      </Layout.Section>
    );
  }

   return (
     <Layout.Section title="CAMPAIGNS">
       <Layout.Block>
         Here be dragons
       </Layout.Block>
     </Layout.Section>
   );

};

CampaignActivityList.propTypes = {
  activityList: React.PropTypes.array.isRequired,
};