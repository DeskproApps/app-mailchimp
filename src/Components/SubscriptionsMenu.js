import React from 'react';
import PropTypes from 'prop-types';
import { Menu, Action } from '@deskpro/apps-components';

export class SubscriptionsMenu extends React.Component
{
  static propTypes = {
    unsubscribeAll: PropTypes.func.isRequired,
  };

  state = {
    open: false
  };

  toggle = () => {
    this.setState({ open: !this.state.open })
  };

  unsubscribe =() => {
    this.toggle();
    this.props.unsubscribeAll();
  };

  render()
  {
    return (
      <Menu isOpen={this.state.open} onClick={this.toggle}>
        <Action icon="unlink" label={"Unsubscribe all"} onClick={this.unsubscribe}/>
      </Menu>
    );
  }
}
