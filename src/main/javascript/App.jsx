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

      dataLoadedTimestamp: null,
      subscriberDetails: null,
      subscriptionStatusList: [],
      memberActivityList: [],
    };

  };

  componentDidMount()
  {
    const setState = this.setState.bind(this);

    this.loadSettings()
      .then(this.setSettingsState)
      .then(this.loadData)
      .catch((err) => {
        if (err instanceof MailchimpAuthenticationError) {
          return { activeView: 'authenticate' };
        }
      })
      .then(setState)
    ;
  }

  loadSettings = () =>
  {
    const { state } = this.props.dpapp;

    return Promise.all([
      state.getAppState('settings'),
      state.getAppState('userSettings')
    ])
    .then((results) => {
      return { settings: results[0], userSettings: results[1] }
    });
  };

  /**
   * @return {Promise.<MailchimpAuthcInfo>}
   */
  setSettingsState = ({ settings, userSettings }) =>
  {
    const { settings: defaultSettings, userSettings: defaultUserSettings } = this.state;

    this.setState({
      settings: settings ? settings : defaultSettings,
      userSettings: userSettings ? userSettings : defaultUserSettings,

    });
    return settings;
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
      .then(() => this.setSettingsState({ userSettings: newUserSettings }))
      .then(() => newUserSettings)
      ;
  };

  /**
   * @param {{}} changes
   * @return Promise.<Object>
   */
  updateSettings = (changes) => {
    const { settings } = this.state;
    const newSettings = { ...settings, ...changes };

    const { dpapp } = this.props;
    return dpapp.state.setAppState('settings', newSettings)
      .then(() => this.setSettingsState({ settings: newSettings }))
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
      const client = this.createClient(mailchimpAuth);
      return this.loadSubscriberDetails(client)
        .then((stateChanges) => ({...stateChanges, activeView: 'home'}))
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

    return dpapp.oauth.access('mailchimp').then(setMailchimpAuthState).then(this.loadData);
  };

  onRegisterMailchimpConnection = (connection) => {
    const { dpapp } = this.props;
    const setState = this.setState.bind(this);

    dpapp.oauth.register('mailchimp', connection)
      .then((connection) => {
        return this.updateSettings({ mailchimpOauthConnectionStatus: 'registered' });
      })
      .then(() => setState({ activeView: 'authenticate' }))
    ;
  };

  renderOauthConnectionView  = () =>
  {
    const { oauth } = this.props.dpapp;
    const model = {
      providerDisplayName: 'Mailchimp',
      providerName: 'mailchimp',
      urlRedirect: oauth.redirectUrl('mailchimp'),
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
