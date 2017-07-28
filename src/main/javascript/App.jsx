import React from 'react';
import ReactDOM from 'react-dom';

import { HomeView, AuthenticationView } from './Components'
import { MemberActivity, SubscriberDetails, MailchimpAuthcInfo } from './Domain'

import { MailchimpFetchClient, fetchLists, fetchSubscriberInfo, updateListSubscriptions, determineMembershipDetails } from './Mailchimp';
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
      activeView: '',
      mailchimpAuth: new MailchimpAuthcInfo({}).toJS(),
      dataLoadedTimestamp: null,
      subscriberDetails: null,
      subscriptionStatusList: [],
      memberActivityList: [],
    };

  };

  componentDidMount()
  {
    this.getMailchimpAuth()
      .then(authc => { //normalize result
        if (!authc) { return null; }
        if (authc.oauthToken || authc.apiKey) { return authc; }
        return null;
      })
      .then(this.onRetrieveMailchimpAuthc)
    ;
      // .catch(e => {
      //   console.log('error', e);
      // })
  }

  /**
   * @param {MailchimpAuthcInfo} authcInfo
   *
   * @return {Promise}
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
        this.setState(state);

        return state;
      })
  };

  getMailchimpAuth = () =>
  {
    const { state } = this.props.dpapp;

    return state.getAppState('settings')
      .then((state) => {
        return !state ? null : state;
      })
      .catch(err => {
        // console.log('got error', err);
        return err;
      })
      .then((result) => {
        if (result instanceof Error || result === null) {
          return null;
        }
        return new MailchimpAuthcInfo(result);
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
    const stateUpdate = authc ? { activeView: 'home', mailchimpAuth: authc.toJS() } : { activeView: 'authenticate' };
    this.setState(stateUpdate);

    if (authc) {
      return this.createClient(authc).then(this.loadData).then(() => authc)
    }

    return Promise.resolve(authc);
  };

  /**
   * @return {Promise.<String>}
   */
  onNewMailchimpAPIKey = () =>
  {
    const { dpapp } = this.props;
    const { dataLoadedTimestamp } = this.state;

    return dpapp.oauth2('mailchimp')
      .then((oauthToken) => new MailchimpAuthcInfo({ oauthToken, apiKey: null }))
      .then(this.updateMailchimpAuth)
      .then(mailchimpAuthc => {
        this.setState({ activeView: 'home', mailchimpAuth: mailchimpAuthc.toJS() });
        return mailchimpAuthc;
      })
      .then((mailchimpAuthc) => {
        if (!dataLoadedTimestamp) {
          return this.createClient(authc).then(this.loadData).then(() => mailchimpAuthc)
        }
        return mailchimpAuthc;

      })
      .then((mailchimpAuthc) => mailchimpAuthc.oauthAccessToken)
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
