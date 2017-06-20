import React from 'react';
import { Layout } from '@deskproapps/deskproapps-sdk-react';

const visibilityStyleHidden = { display: 'none' };

const visibilityStyleVisible = { display: 'block' };

export class SubscriptionsList extends React.Component {

  static propTypes = {
    statusList: React.PropTypes.array.isRequired,
    size: React.PropTypes.number.isRequired
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
    const listTailSize = statusList.length - size;

    this.state = {
      uiState: statusList.length === 0 ? 'empty' : 'normal',
      showMoreSectionEnabled: listTailSize > 0,
      showMoreText: listTailSize > 0 ? `SHOW ${listTailSize} MORE` : '',
      showLessText: listTailSize > 0 ? `SHOW LESS` : ''
    }
  };

  componentWillReceiveProps(nextProps)
  {
    const uiState = nextProps.statusList.length === 0 ? 'empty' : 'normal';

    if (uiState !== this.state.uiState) {
      this.setState({ uiState });
    }
  }

  onUnsubcribeAll = () => {

  };

  toggleSubscription = () =>
  {

  };

  toggleMoreSectionVisibility = () =>
  {
    console.log(this.refs);

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
   * @param {SubscriptionStatus} status
   */
  mapStatusToListItemMarkup = status =>
  {
    return (
      <div>
        <label>
          <input type="checkbox"  value={status.id} checked={status.isSubscribed} onChange={this.toggleSubscription} />
          { status.name }
        </label>
      </div>
    );
  };

  renderEmptyState = () =>
  {
    return (
      <Layout.Section title="SUBSCRIPTIONS">
        You have no lists
      </Layout.Section>
    );
  };

  renderNormalState = () =>
  {
    const { statusList, size } = this.props;
    const {showMoreSectionEnabled, showMoreText} = this.state;

    // replacement for
    // return (
    //   <Layout.Section title="SUBSCRIPTIONS">
    //     <Layout.Block>
    //
    //       <div>
    //         { statusList.slice(0, size).map(this.mapStatusToMarkup) }
    //       </div>
    //
    //       { showMoreSectionEnabled &&
    //         <div ref="moreListRef" style={visibilityStyleHidden}>
    //           { showMoreSectionEnabled && statusList.slice(size).map(this.mapStatusToMarkup) }
    //         </div>
    //       }
    //
    //     </Layout.Block>
    //
    //     { showMoreSectionEnabled &&
    //       <Layout.Block>
    //         <a href="#" onClick={this.toggleMoreSectionVisibility}>
    //           <span className="text small" ref="showLabelRef">{showMoreText}</span>
    //         </a>
    //       </Layout.Block>
    //     }
    //
    //   </Layout.Section>
    // );

    return (
    <div className="ui vertical segment form" style={{ borderColor: 'white' }}>
      <div className="ui dividing header">
        <div className="content" style={{width: '100%'}}>
          <span style={{float: 'left'}}>SUBSCRIPTIONS</span>  <a href="#" style={{float: 'right'}} onClick={this.onUnsubcribeAll}><span className="text small" >Unsubscribe all</span> </a>
        </div>
      </div>

      <Layout.Block>

        <div>
          { statusList.slice(0, size).map(this.mapStatusToListItemMarkup) }
        </div>

        { showMoreSectionEnabled &&
        <div ref="moreListRef" style={visibilityStyleHidden}>
          { showMoreSectionEnabled && statusList.slice(size).map(this.mapStatusToListItemMarkup) }
        </div>
        }

      </Layout.Block>

      { showMoreSectionEnabled &&
      <Layout.Block>
        <a href="#" onClick={this.toggleMoreSectionVisibility}>
          <span className="text small" ref="showLabelRef">{showMoreText}</span>
        </a>
      </Layout.Block>
      }

    </div>
    )

  };

  render() {
    const { uiState } = this.state;

    if (uiState === 'empty') { return this.renderEmptyState(); }
    if (uiState === 'normal') { return this.renderNormalState(); }

    return (<noscript/>);
  }

}