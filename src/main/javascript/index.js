import ReactDOM from 'react-dom';
import { DeskproAppContainer } from '@deskproapps/deskproapps-sdk-react';
import App from './App';

export function runApp(app) {
  ReactDOM.render(
    <DeskproAppContainer app={app} name={'MAILCHIMP'} mainComponent={App} />,
    document.getElementById('deskpro-app')
  );
}
