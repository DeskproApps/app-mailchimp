import React from 'react';
import { Container, Section, Heading, List, HiddenFields } from '@deskpro/react-components';

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
    statusList: React.PropTypes.array.isRequired,
    size: React.PropTypes.number.isRequired,
    onSubscriptionStatusChange: React.PropTypes.func
  };

  static defaultProps = {
    size: 3
  };

  constructor(props)
  {
    super(props);
    this.initState();
  }

  get statusList()
  {
    const { statusList } = this.props;
    const { internalStatusList } = this.state;

    return internalStatusList ? internalStatusList : statusList;
  }

  initState = () =>
  {
    const { statusList, size } = this.props;
    const listTailSize = statusList.length - size;

    this.state = {
      internalStatusList: null,
      uiState: statusList.length === 0 ? 'empty' : 'normal',
      showMoreSectionEnabled: listTailSize > 0,
      showMoreText: listTailSize > 0 ? `SHOW ${listTailSize} MORE` : '',
      showLessText: listTailSize > 0 ? `SHOW LESS` : ''
    }
  };


  componentWillReceiveProps(nextProps)
  {
    const uiState = nextProps.statusList.length === 0 ? 'empty' : 'normal';

    let state = {};

    if (uiState !== this.state.uiState) {
      state = { ...state, uiState};
    }

    if (nextProps.statusList.length !== this.props.statusList.length) {
      state = { ...state, internalStatusList: [].concat(nextProps.statusList)};
    }

    if (Object.keys(state).length) {
      this.setState(state);
    }
  }

  onUnsubcribeAll = () =>
  {
    const previousList = [];
    const currentList = [];

    const reducer = (acc, status) => {
      const newStatus = status.isSubscribed() ? status.toggleIsSubscribed() : status;
      acc.push(newStatus);

      if ( status.isSubscribed()) {
        previousList.push(status);
        currentList.push(newStatus);
      }

      return acc;
    };
    const internalStatusList = this.statusList.reduce(reducer, []);
    // there are no changes
    if (currentList.length === 0) { return; }
    this.setState({ internalStatusList });

    const { onSubscriptionStatusChange } = this.props;
    if (onSubscriptionStatusChange) {
      onSubscriptionStatusChange(previousList, currentList);
    }
  };

  toggleSubscription = (event) =>
  {
    const { value: statusId } = event.target;

    const index = indexOf(status => status.id === statusId, this.statusList);
    if (index === -1) { return false; }

    const status = this.statusList[index];
    const newStatus = status.toggleIsSubscribed();

    const internalStatusList = [].concat(this.statusList);
    internalStatusList[index] = newStatus;
    this.setState({ internalStatusList });

    const { onSubscriptionStatusChange } = this.props;
    if (onSubscriptionStatusChange) {
      onSubscriptionStatusChange([status], [newStatus]);
    }
  };

  /**
   * @param {MembershipDetails} status
   */
  mapStatusToListItemMarkup = status =>
  {
    return (
      <div>
        <label>
          <input type="checkbox"  value={status.id} checked={status.isSubscribed()} onChange={this.toggleSubscription} />
          { status.listName }
        </label>
      </div>
    );
  };

  renderEmptyState = () =>
  {
    return (
      <Container>
        <Heading size={3}>
          Subscriptions
        </Heading>
        You have no lists
      </Container>
    );
  };

  renderNormalState = () =>
  {

    const { size } = this.props;

    const listTailSize = this.statusList.length - size;
    const showMoreSectionEnabled = listTailSize > 0;
    const showMoreText = listTailSize > 0 ? `SHOW ${listTailSize} MORE` : '';
    const showLessText = listTailSize > 0 ? `SHOW LESS` : '';

    return (
      <Container>
        <Heading size={3}>
          <span style={{float: 'left'}}>SUBSCRIPTIONS</span>  <a href="#" style={{float: 'right', fontSize: '9px'}} onClick={this.onUnsubcribeAll}><span>Unsubscribe all</span> </a>
        </Heading>

        <List style={{ paddingLeft: 0 }}>
          { this.statusList.slice(0, size).map(this.mapStatusToListItemMarkup) }
        </List>

        { showMoreSectionEnabled &&
          <HiddenFields opened={false} labelShow={showMoreText} labelHide={showLessText}>
            <List style={{ paddingLeft: 0 }}>
              { this.statusList.slice(size).map(this.mapStatusToListItemMarkup) }
            </List>
          </HiddenFields>
        }

      </Container>
    )
  };

  render()
  {
    switch (this.state.uiState) {
      case 'empty':
        return this.renderEmptyState();
      case 'normal':
        return this.renderNormalState();
      default:
        return <noscript/>;
    }
  }

}