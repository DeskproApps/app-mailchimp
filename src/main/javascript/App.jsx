import React from 'react';
import ReactDOM from 'react-dom';

import { HomeView, AuthenticationView, OauthConnectionView } from './Components'
import { MemberActivity, SubscriberDetails } from './Domain'

import { MailchimpFetchClient, MailchimpAuthcInfo, MailchimpAuthenticationError, fetchLists, fetchSubscriberInfo, updateListSubscriptions, determineMembershipDetails } from './Mailchimp';
import { parseSubscriberDetails } from './Deskpro';

export default class App extends React.Component
{
  static propTypes = { dpapp: React.PropTypes.object.isRequired };

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
        mailchimpOauthConnectionStatus: 'unregistered',
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
      .catch((err) => {
        if (err instanceof MailchimpAuthenticationError) {
          return { activeView: 'authenticate' };
        }
        return {};
      })
      .then(this.setState.bind(this))
    ;
  }

  loadAllSettings = () =>
  {
    const { state } = this.props.dpapp;
    const { oauth } = this.props.dpapp;

    return Promise.all([
      state.getAppState('settings'),
      state.getAppState('userSettings'),
      oauth.settings('mailchimp')
    ])
    .then((results) => {
      return { settings: results[0], userSettings: results[1], oauthSettings: results[2] }
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
      oauthSettings: defaultOauthSettings,
    } = this.state;

    const newSettings = settings ? settings : defaultSettings;
    const newUserSettings = userSettings ? userSettings : defaultUserSettings;
    const newOauthSettings = oauthSettings ? oauthSettings : defaultOauthSettings;

    // make settings available immediately, via setState they are not available to chained promises immediatelly
    this.state.settings = newSettings;
    this.state.userSettings = newUserSettings;
    this.state.oauthSettings = newOauthSettings;

    const changes = { settings: newSettings, userSettings: newUserSettings, oauthSettings: newOauthSettings };
    this.setState(changes);
    return changes;
  };

  /**
   * @param {{}} changes
   * @return Promise.<Object>
   */
  updateUserSettings = (changes) => {
    const { userSettings } = this.state;
    const newUserSettings = { ...userSettings, ...changes };

    const { dpapp } = this.props;
    return dpapp.state.setAppState('userSettings', newUserSettings)
      .then(() => this.setAllSettingsState({ userSettings: newUserSettings }))
      .then(() => newUserSettings)
      ;
  };

  /**
   * @param {{}} changes
   * @return Promise.<Object>
   */
  updateAppSettings = (changes) => {
    const { settings } = this.state;
    const newSettings = { ...settings, ...changes };

    const { dpapp } = this.props;
    return dpapp.state.setAppState('settings', newSettings)
      .then(() => this.setAllSettingsState({ settings: newSettings }))
      .then(() => newSettings)
      ;
  };

  loadData = () =>
  {
    const { settings, userSettings } = this.state;

    if (settings.mailchimpAuthType === 'api-key') {
      return {};
    }

    // oauth
    const mailchimpAuth = MailchimpAuthcInfo.fromJS(userSettings.mailchimpAuth);
    if (mailchimpAuth.apiCredentials) { // try and load subscriber details
      return this.createClient(mailchimpAuth)
        .then(this.loadSubscriberDetails)
        .then((stateChanges) => ({...stateChanges, activeView: 'home'}))
      ;
    }

    if (settings.mailchimpOauthConnectionStatus == 'unregistered') {
      return { activeView : 'registerAuthcConnection' };
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
    const { fetchCORS: fetch } = this.props.dpapp.restApi;
    return MailchimpFetchClient.fromAuthc(authcInfo, fetch);
  };

  /**
   * @param {MailchimpFetchClient} client
   * @return {Promise.<{}>}
   */
  loadSubscriberDetails = (client) =>
  {
    const { context } = this.props.dpapp;
    return context.getTabData()
      .then(tabData => tabData.api_data.person)
      .then(parseSubscriberDetails)
      .then(deskproSubscriberDetails => {
        return Promise.all([
          fetchLists(client), fetchSubscriberInfo(client, deskproSubscriberDetails)
        ])
        .then(results => { //normalize return results
          return {lists: results [0], listActivity: results[1][0], listMemberships: results[1][1], subscriberDetails: results[1][2]}
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
   * @param {Array<MembershipDetails>} previousList
   * @param {Array<MembershipDetails>} currentList
   * @return {Promise.<Array>}
   */
  onSubscriptionStatusChange = (previousList, currentList) =>
  {
    const { mailchimpAuth, subscriberDetails } = this.state;
    const authcInfo = new MailchimpAuthcInfo(mailchimpAuth);
    const { apiKey: key } = authcInfo;

    const { fetchCORS: fetch } = this.props.dpapp.restApi;
    const client = new MailchimpFetchClient({ key, fetch });

    return updateListSubscriptions(client, subscriberDetails, previousList, currentList);
  };

  /**
   * @return {Promise.<String>}
   */
  onNewMailchimpAPIKey = () =>
  {
    const { dpapp } = this.props;

    const setMailchimpAuthState = (oauth2Token) => {
      const mailchimpAuthc = new MailchimpAuthcInfo({ oauth2Token, apiKey: null });
      const changes = { mailchimpAuth: mailchimpAuthc.toJS(), activeView: 'home' };

      return this.updateUserSettings(changes).then(() => mailchimpAuthc);
    };

    return dpapp.oauth.access('mailchimp')
      .then(setMailchimpAuthState)
      .then(this.loadData)
      .then(this.setState.bind(this));
  };

  onRegisterMailchimpConnection = (connection) => {
    const { dpapp } = this.props;

    dpapp.oauth.register('mailchimp', connection)
      .then((connection) => {
        return this.updateAppSettings({ mailchimpOauthConnectionStatus: 'registered' });
      })
      .then(() => ({ activeView: 'authenticate' }))
      .then(this.setState.bind(this))
    ;
  };

  renderOauthConnectionView  = () =>
  {
    const { oauthSettings } = this.state;
    const model = {
      providerDisplayName: 'Mailchimp',
      providerName: 'mailchimp',
      urlRedirect: oauthSettings.urlRedirect,
      urlAuthorize: 'https://login.mailchimp.com/oauth2/authorize',
      urlAccessToken: 'https://login.mailchimp.com/oauth2/token',
      urlResourceOwnerDetails: 'https://login.mailchimp.com/oauth2/metadata'
    };
    return (<OauthConnectionView onAddConnection={this.onRegisterMailchimpConnection} model={model} />)
  };

  renderAuthenticationView = () =>
  {
    return (<AuthenticationView onAuthenticate={this.onNewMailchimpAPIKey} />)
  };

  renderHomeView = () =>
  {
    const { subscriberDetails, subscriptionStatusList, memberActivityList } = this.state;
    return (<HomeView  subscriberDetails={subscriberDetails} subscriptionStatusList={subscriptionStatusList} memberActivityList={memberActivityList} onSubscriptionStatusChange={this.onSubscriptionStatusChange}/>)
  };

  render()
  {
    const { activeView } = this.state;

    if (activeView === 'home') { return this.renderHomeView(); }

    if (activeView === 'authenticate') { return this.renderAuthenticationView(); }

    if (activeView === 'registerAuthcConnection') { return this.renderOauthConnectionView(); }

    return (<noscript/>);
  }
}
