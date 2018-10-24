import React from 'react';
import PropTypes from 'prop-types';
import { ActionBar, ListItem, Level, Panel, DataTable } from '@deskpro/apps-components';

export class MemberActivityList extends React.Component
{
  static propTypes = {
    activityList: PropTypes.array.isRequired
  };

  static defaultProps = {};

  constructor(props)
  {
    super(props);

    this.state = {
      uiState: props.activityList.length === 0 ? 'empty' : 'normal'
    };
  }

  componentWillReceiveProps(nextProps)
  {
    const uiState = nextProps.activityList.length === 0 ? 'empty' : 'normal';

    if (uiState !== this.state.uiState) {
      this.setState({ uiState });
    }
  }

  getActivityStatus = activity =>
  {
    switch (activity.status) {
      case 'bounce':
        return `${activity.bounceType} ${activity.status}`;
      default:
        return activity.status;
    }
  };

  /**
   * @param {MemberActivity} activity
   */
  mapActivityToMarkup = activity =>
  {
    return (
      <ListItem>
        <ActionBar  title={activity.campaignTitle} />

        <Level>
          <Level align={"left"}>
            <span><span>{activity.date}</span> | <span>{this.getActivityStatus(activity)}</span></span>
          </Level>
        </Level>
      </ListItem>
    );
  };

  renderEmptyState = () => <Panel title={"Campaigns"}>
    <p>
      No recorded campaign activity yet
    </p>
  </Panel>;

  renderNormalState = () => {

    const { activityList } = this.props;

    return (
      <Panel title={"Campaigns"}>
        {activityList.map(status => this.mapActivityToMarkup(status))}
      </Panel>
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
