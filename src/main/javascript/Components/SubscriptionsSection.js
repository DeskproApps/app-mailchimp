import React from 'react';
import { Container, Section, Heading } from '@deskpro/react-components';

const visibilityStyleHidden = { display: 'none' };
const visibilityStyleVisible = { display: 'block' };

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

  toggleMoreSectionVisibility = () =>
  {
    const {moreListRef, showLabelRef} = this.refs;
    const {showMoreText, showLessText} = this.state;

    let moreListRefStyle;
    let showLabelText;

    if (moreListRef.style.display == 'none') {
      moreListRefStyle = visibilityStyleVisible;
      showLabelText = showLessText;
    } else if (moreListRef.style.display == 'block') {
      moreListRefStyle = visibilityStyleHidden;
      showLabelText = showMoreText;
    }

    if (moreListRefStyle) {
      Object.keys(moreListRefStyle).forEach(property => moreListRef.style[property] = moreListRefStyle[property]);
    }

    if (showLabelText) {
      showLabelRef.innerHTML = showLabelText
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
    const { showMoreSectionEnabled, showMoreText } = this.state;

    return (
    <div className="ui vertical segment form" style={{ borderColor: 'white' }}>
      <div className="ui dividing header">
        <div className="content" style={{width: '100%'}}>
          <span style={{float: 'left'}}>SUBSCRIPTIONS</span>  <a href="#" style={{float: 'right'}} onClick={this.onUnsubcribeAll}><span className="text small" >Unsubscribe all</span> </a>
        </div>
      </div>

      <Section>

        <div>
          { this.statusList.slice(0, size).map(this.mapStatusToListItemMarkup) }
        </div>

        { showMoreSectionEnabled &&
        <div ref="moreListRef" style={visibilityStyleHidden}>
          { showMoreSectionEnabled && this.statusList.slice(size).map(this.mapStatusToListItemMarkup) }
        </div>
        }

      </Section>

      { showMoreSectionEnabled &&
      <Section>
        <a href="#" onClick={this.toggleMoreSectionVisibility}>
          <span className="text small" ref="showLabelRef">{showMoreText}</span>
        </a>
      </Section>
      }

    </div>
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