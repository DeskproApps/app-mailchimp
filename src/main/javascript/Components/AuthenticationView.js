import React from 'react';
import { Layout } from '@deskproapps/deskproapps-sdk-react';

export const AuthenticationView = ({ onAuthenticate }) => {

  const onAuthenticateListener = event => { onAuthenticate (); };

  return (
    <Layout.Section>
      <p>
        This seems to be the first time you are running this application.
      </p>

      <br/>

      <Layout.Button primary onClick={onAuthenticateListener}>Authenticate</Layout.Button>
    </Layout.Section>
  );
};

AuthenticationView.propTypes = {
  onAuthenticate: React.PropTypes.func.isRequired,
};