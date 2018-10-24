import React from 'react';
import PropTypes from 'prop-types';
import { parseSubscriberDetails } from './Deskpro';
import { HomeView, AuthenticationView } from './Components'
import {
  MailchimpFetchClient,
  MailchimpAuthcInfo,
  MailchimpAuthenticationError,
  fetchLists,
  fetchSubscriberInfo,
  updateListSubscriptions,
  determineMembershipDetails
} from './Mailchimp';

import './styles.css';

export default class App extends React.Component
{
  static propTypes = {
    dpapp: PropTypes.object
  };

  constructor(props)
  {
    super(props);
    this.initState();
  }

  initState = () =>
  {
    this.state = {
      activeView: 'home',
      userSettings: {
        mailchimpAuth: new MailchimpAuthcInfo({}).toJS(),
      },
      settings: {
        mailchimpAuthType: 'oauth', // 'api-key', 'oauth'
        mailchimpOauthConnectionStatus: 'registered',
      },
      oauthSettings: {
        urlRedirect: ''
      },

      dataLoadedTimestamp: null,
      subscriberDetails: null,
      subscriptionStatusList: [],
      memberActivityList: [],
    };

  };

  componentDidMount()
  {
    this.loadAllSettings()
      .then(this.setAllSettingsState)
      .then(this.loadData)
      .catch(err => {
        if (err instanceof MailchimpAuthenticationError) {
          return { activeView: 'authenticate' };
        }
        this.props.dpapp.ui.showErrorNotification(err, 'An error occurred');
        console.log(err);
        return {};
      })
      .then(this.setState.bind(this))
    ;
  }

  loadAllSettings = () =>
  {
    const { storage} = this.props.dpapp;

    return Promise.all([
      storage.getAppStorage('settings'),
      storage.getAppStorage('userSettings')
    ])
    .then((results) => {
      return {
        settings: results[0],
        userSettings: results[1]
      }
    });
  };

  /**
   * @param settings
   * @param userSettings
   * @param oauthSettings
   * @return {{settings, userSettings}}
   */
  setAllSettingsState = ({ settings, userSettings, oauthSettings }) =>
  {
    const {
      settings: defaultSettings,
      userSettings: defaultUserSettings,
    } = this.state;

    const newSettings = settings ? settings : defaultSettings;
    const newUserSettings = userSettings ? userSettings : defaultUserSettings;

    const changes = { settings: newSettings, userSettings: newUserSettings };
    this.setState(changes);
    return changes;
  };


  loadData = ({ settings, userSettings }) =>
  {
    if (settings.mailchimpOauthConnectionStatus !== 'registered') {
      return { activeView : 'authenticate' };
    }

    if (settings.mailchimpAuthType === 'api-key') {
      return {};
    }

    // oauth
    const mailchimpAuth = MailchimpAuthcInfo.fromJS(userSettings.mailchimpAuth);
    if (mailchimpAuth.apiCredentials) { // try and load subscriber details
      return this.createClient(mailchimpAuth)
        .then(this.loadSubscriberDetails)
        .then((stateChanges) => {
          return {...stateChanges, activeView: 'home'}
        })
      ;
    }

    // missing auth tokens somehow
    return { activeView : 'authenticate' };

  };

  /**
   * @param {MailchimpAuthcInfo} authcInfo
   *
   * @return {Promise.<MailchimpAuthcInfo>}
   */
  createClient = (authcInfo) =>
  {
    const { fetchProxy: fetch } = this.props.dpapp.restApi;
    return MailchimpFetchClient.fromAuthc(authcInfo, fetch.bind(this.props.dpapp.restApi));
  };

  /**
   * @param {MailchimpFetchClient} client
   * @return {Promise.<{}>}
   */
  loadSubscriberDetails = (client) =>
  {
    const { context } = this.props.dpapp;
    return context.get('ticket').get('data.person')
      .then(parseSubscriberDetails)
      .then(deskproSubscriberDetails => {
        return Promise.all([
          fetchLists(client), fetchSubscriberInfo(client, deskproSubscriberDetails)
        ])
        .then(results => { //normalize return results
          return {
            lists: results[0],
            listActivity: results[1][0],
            listMemberships: results[1][1],
            subscriberDetails: results[1][2]
          }
        })
      })
      .then(({ subscriberDetails, lists, listActivity, listMemberships }) => {
        const subscriptionStatusList = determineMembershipDetails(lists, listMemberships);
        return {
          dataLoadedTimestamp: new Date().getTime(),
          subscriptionStatusList,
          subscriberDetails,
          memberActivityList: listActivity
        };
      })
  };

  /**
   * @param {Array<MembershipDetails>} currentList
   * @param {Array<MembershipDetails>} nextList
   * @return {Promise.<Array>}
   */
  onSubscriptionStatusChange = (currentList, nextList) =>
  {
    const { userSettings, subscriberDetails } = this.state;
    this.createClient(MailchimpAuthcInfo.fromJS(userSettings.mailchimpAuth))
      .then(client => updateListSubscriptions(client, subscriberDetails, currentList, nextList))
      .then(() => {
        this.setState({ subscriptionStatusList: nextList })
      })
    ;
  };

  renderAuthenticationView = () =>
  {
    return (<AuthenticationView onAuthenticate={this.onNewMailchimpAPIKey} />)
  };

  renderHomeView = () =>
  {
    const { subscriberDetails, subscriptionStatusList, memberActivityList } = this.state;
    return (
      <HomeView
        subscriberDetails={subscriberDetails}
        subscriptionStatusList={subscriptionStatusList}
        memberActivityList={memberActivityList}
        onSubscriptionStatusChange={this.onSubscriptionStatusChange}
      />
    )
  };

  render()
  {
    switch (this.state.activeView) {
      case 'home':
        return this.renderHomeView();
      case 'authenticate':
        return this.renderAuthenticationView();
      default:
        return <noscript />;
    }
  }
}
