import React from 'react';
import { Layout } from '@deskproapps/deskproapps-sdk-react';

export const AuthenticationView = ({ onAuthenticate }) => {

  let apiKey = null;
  const onChangeListener = event => { apiKey = event.target.value; };
  const onAuthenticateListener = event => { onAuthenticate (apiKey); };

  return (
    <Layout.Section>
      <p>
        This seems to be the first time you are running this application.
      </p>
      <p>
        Enter your MailChimp API key:
      </p>

      <div className="ui fluid input">
        <input type="text" placeholder="12345678901234567890123456789012-xx1" onChange={ onChangeListener }/>
      </div>

      <br/>

      <Layout.Button primary onClick={onAuthenticateListener}>Authenticate</Layout.Button>
    </Layout.Section>
  );
};

AuthenticationView.propTypes = {
  onAuthenticate: React.PropTypes.func.isRequired,
};