import React from 'react';
import PropTypes from 'prop-types';
import { Action, Button, DataTable, Panel} from '@deskpro/apps-components';

const indexOf = (search, list) => {
  let index = -1;

  for (let i = 0; i < list.length; i++) {
    if (search(list[i])) {
      index = i;
      break;
    }
  }

  return index;
};

export class SubscriptionsList extends React.Component
{
  static propTypes = {
    statusList:                 PropTypes.array.isRequired,
    size:                       PropTypes.number.isRequired,
    onSubscriptionStatusChange: PropTypes.func
  };

  static defaultProps = {
    size: 3
  };

  constructor(props)
  {
    super(props);
    this.initState();
  }

  initState = () =>
  {
    const { statusList, size } = this.props;
    const moreSize = statusList.length - size;

    this.state = {
      internalStatusList: null,
      showMore: moreSize > 0,
      showMoreButton: moreSize > 0
    }
  };

  get statusList()
  {
    const { statusList } = this.props;
    const { internalStatusList } = this.state;

    return internalStatusList ? internalStatusList : statusList;
  }

  onUnsubscribeAll = () =>
  {
    let unsubscribed = 0;
    const reducer = (acc, status) => {
      const newStatus = status.isSubscribed() ? status.toggleIsSubscribed() : status;
      acc.push(newStatus);

      if (!status.isSubscribed()) {
        unsubscribed++;
      }

      return acc;
    };
    const newStatusList = this.props.statusList.reduce(reducer, []);

    // already not subscribed to anythging
    if (unsubscribed === this.props.statusList.length) {
      return;
    }

    const { onSubscriptionStatusChange } = this.props;
    if (onSubscriptionStatusChange) {
      onSubscriptionStatusChange(this.props.statusList, newStatusList);
    }
  };

  toggleSubscription = (event) =>
  {
    const { value: statusId } = event.target;

    const index = indexOf(status => status.id === statusId, this.props.statusList);
    if (index === -1) { return false; }

    const status = this.statusList[index];
    const newStatus = status.toggleIsSubscribed();

    const newStatusList = [].concat(this.props.statusList);
    newStatusList[index] = newStatus;

    const { onSubscriptionStatusChange } = this.props;
    if (onSubscriptionStatusChange) {
      onSubscriptionStatusChange(this.props.statusList, newStatusList);
    }
  };

  renderEmptyState = () =>
  {
    return (
      <Panel title={"Subscriptions"}>
        <p>You have no lists</p>
      </Panel>
    );
  };

  renderNormalState = () =>
  {

    const { showMore, showMoreButton } = this.state;

    const columns = [

      status => status.listName,

      status => <div style={{ textAlign: "right" }}>
        <input type="checkbox"  value={status.id} checked={status.isSubscribed()} onChange={this.toggleSubscription} />
      </div>

    ];

    const { size } = this.props;
    const moreSize = this.statusList.length - size;
    const list = showMore ? this.statusList : this.statusList.slice(0, size);

    return (
      <Panel title={"Subscriptions"}>
        <Action icon={"unlink"} label={"Unsubscribe all"} onClick={this.onUnsubscribeAll} />

        <DataTable data={list} columns={columns} />

        {
          showMoreButton && <Button onClick={() => this.setState({ showMore: !showMore })}>
            { showMore ? `SHOW LESS` : `SHOW ${moreSize} MORE` }
          </Button>
        }

      </Panel>
    );
  };

  render()
  {
    const uiState = this.props.statusList.length === 0 ? 'empty' : 'normal';
    switch (uiState) {
      case 'empty':
        return this.renderEmptyState();
      case 'normal':
        return this.renderNormalState();
      default:
        return <noscript/>;

    }
  }

}
