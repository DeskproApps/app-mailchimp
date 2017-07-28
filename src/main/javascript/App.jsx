import React from 'react';
import ReactDOM from 'react-dom';

import { HomeView, AuthenticationView } from './Components'
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
      mailchimpAuth: new MailchimpAuthcInfo({}).toJS(),
      dataLoadedTimestamp: null,
      subscriberDetails: null,
      subscriptionStatusList: [],
      memberActivityList: [],
    };

  };

  componentDidMount()
  {
    this.loadMailchimpAuth().then(this.onRetrieveMailchimpAuthc);
  }

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
  loadData = (client) =>
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

        const state = {
          dataLoadedTimestamp: new Date().getTime(),
          subscriptionStatusList,
          subscriberDetails,
          memberActivityList: listActivity
        };

        return state;
      })
  };

  /**
   * @return {Promise.<MailchimpAuthcInfo>}
   */
  loadMailchimpAuth = () =>
  {
    const { state } = this.props.dpapp;

    return state.getAppState('settings')
      .then((state) => {
        return state ? MailchimpAuthcInfo.fromJS(state) : null;
      })
      .catch(err => {
        // console.log('got error', err);
        if (err instanceof Error || err === null) {
          return null;
        }
      });
  };

  /**
   * @param {MailchimpAuthcInfo} mailchimpAuthc
   * @return {Promise.<MailchimpAuthcInfo>}
   */
  updateMailchimpAuth = (mailchimpAuthc) =>
  {
    const { state } = this.props.dpapp;
    return state.setAppState('settings', mailchimpAuthc.toJS()).then(js => mailchimpAuthc)
      .catch(err => {
        //console.log('got error', err);
        return null;
      });
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
   * @param {MailchimpAuthcInfo} authc
   * @return {Promise.<MailchimpAuthcInfo>}
   */
  onRetrieveMailchimpAuthc = (authc) =>
  {
    const hasValidAuthc = authc && authc.apiCredentials;

    const mailchimpAuth  = hasValidAuthc ?  authc.toJS() : new MailchimpAuthcInfo({}).toJS();
    const activeView = hasValidAuthc ? 'home' : 'authenticate';

    const viewState = {activeView, mailchimpAuth};
    const authcView = { activeView: 'authenticate', mailchimpAuth: new MailchimpAuthcInfo({}).toJS() };

    if (hasValidAuthc) {

      const handleAuthcError = (err) => {
        if (err instanceof MailchimpAuthenticationError) {
          this.setState(authcView);
        }
        return Promise.reject(err);
      };

      return this.createClient(authc)
        .then(this.loadData)
        .then((stateChanges) => {
          this.setState({...stateChanges, ...viewState})
        })
        .then(() => authc)
        .catch(handleAuthcError)
    }

    this.setState(authcView);
    return Promise.reject(new Error('missing or invalid authentication'));
  };

  /**
   * @return {Promise.<String>}
   */
  onNewMailchimpAPIKey = () =>
  {
    const { dpapp } = this.props;
    const { dataLoadedTimestamp } = this.state;

    return dpapp.oauth.access('mailchimp')
      .then((oauth2Token) => new MailchimpAuthcInfo({ oauth2Token, apiKey: null }))
      .then(this.updateMailchimpAuth)
      .then(mailchimpAuthc => {
        const homeView = { activeView: 'home', mailchimpAuth: mailchimpAuthc.toJS() };
        this.setState(homeView);
        return mailchimpAuthc;
      })
      .then((mailchimpAuthc) => {
        if (!dataLoadedTimestamp) {
          return this.createClient(mailchimpAuthc)
            .then(this.loadData)
            .then((stateChanges) => {
              this.setState(stateChanges);
              return mailchimpAuthc;
            })
        }
        return mailchimpAuthc;
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
    return (<HomeView  subscriberDetails={subscriberDetails} subscriptionStatusList={subscriptionStatusList} memberActivityList={memberActivityList} onSubscriptionStatusChange={this.onSubscriptionStatusChange}/>)
  };

  render()
  {
    const { activeView } = this.state;

    if (activeView === 'home') { return this.renderHomeView(); }

    if (activeView === 'authenticate') { return this.renderAuthenticationView(); }

    return (<noscript/>);
  }
}
