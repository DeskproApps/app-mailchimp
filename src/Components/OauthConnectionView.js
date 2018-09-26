import React from 'react';
import PropTypes from 'prop-types';
import OauthConnectionForm from './OauthConnectionForm'

import { Panel } from '@deskpro/apps-components';

export const OauthConnectionView = ({ onAddConnection, model }) => {
  const onSubmitHandler = (userModel) => {
    const finalModel = { ...model, ...userModel };
    onAddConnection(finalModel);
    return false;
  };

  return (
    <Panel title={"Create OAuth Connection"}>
      <p>
        This seems to be the first time you are running the application.
      </p>
      <p>
        Login into your {model.providerDisplayName} account and register a new oauth app
      </p>
      <OauthConnectionForm onSubmit={onSubmitHandler} providerDisplayName={model.providerDisplayName} urlRedirect={model.urlRedirect} initialValues={model}/>
    </Panel>
  );
};

OauthConnectionView.defaultProps = {
  model: {}
};

OauthConnectionView.propTypes = {
  onAddConnection: PropTypes.func.isRequired,
  model: PropTypes.object
};
