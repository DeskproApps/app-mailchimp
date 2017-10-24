import React from 'react';
import { Container, Button } from '@deskpro/react-components';

export const AuthenticationView = ({ onAuthenticate }) => {

  const onAuthenticateListener = event => { onAuthenticate(); };

  return (
    <Container>
      <p>
        This seems to be the first time you are running this application.
      </p>
      <Button onClick={onAuthenticateListener}>
        Authenticate
      </Button>
    </Container>
  );
};

AuthenticationView.propTypes = {
  onAuthenticate: React.PropTypes.func.isRequired,
};