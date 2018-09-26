import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@deskpro/apps-components';

export const AuthenticationView = ({ onAuthenticate }) => {

  const onAuthenticateListener = event => { onAuthenticate(); };

  return (
    <div>
      <p>
        This seems to be the first time you are running this application.
      </p>
      <Button type="submit" appearance={"primary"} onClick={onAuthenticateListener}>
        Authenticate
      </Button>
    </div>
  );
};

AuthenticationView.propTypes = {
  onAuthenticate: PropTypes.func.isRequired,
};
