import React from 'react';
import PropTypes from 'prop-types';
import { ActionBar, List, ListItem, Level, Panel, DataTable } from '@deskpro/apps-components';

export class MemberActivityList extends React.Component
{
  static propTypes = {
    activityList: PropTypes.array.isRequired
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
      <ListItem>
        <ActionBar  title={status.campaignTitle} />

        <Level>
          <Level align={"left"}>
            <span>{status.date}</span><span> | </span><span>{status.status}</span>
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

    const columns =  [
      status => status.date,
      status => status.status,
    ];

    return (
      <Panel title={"Campaigns"}>
        <DataTable columns={columns} data={activityList} />
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
