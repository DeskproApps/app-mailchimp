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

    // const dummyDataState = {
    //   subscriberDetails: new MemberInfo({ email: 'zack.prudent@techcompany.com', fullName: 'Zack Prudent', rating: 4 }),
    //   subscriptionStatusList: [
    //     new SubscriptionStatus({ id: 1, name : 'iPhone 6s & Plus SDK Issue', isSubscribed: false })
    //     , new SubscriptionStatus({ id: 2, name : 'All Hercules Developers', isSubscribed: true })
    //     , new SubscriptionStatus({ id: 3, name : 'Deskpro Developers', isSubscribed: false })
    //     , new SubscriptionStatus({ id: 4, name : 'List no. 4', isSubscribed: false })
    //     , new SubscriptionStatus({ id: 5, name : 'List no. 5', isSubscribed: false })
    //
    //   ],
    //   memberActivityList: [
    //     new MemberActivity({ subjectLine: 'Schedules API', status: 'DELIVERED', date: '11/03/2016' }),
    //     new MemberActivity({ subjectLine: 'API Breaking Changes: DELETE Response code change', status: 'READ', date: '11/03/2016' }),
    //     new MemberActivity({ subjectLine: 'Deskpro Apps Newsletter 9', status: 'READ', date: '03/02/2016' }),
    //     new MemberActivity({ subjectLine: 'Browser Optimisation', status: 'READ', date: '11/03/2016' }),
    //     new MemberActivity({ subjectLine: 'Major new features', status: 'READ', date: '11/03/2016' }),
    //     new MemberActivity({ subjectLine: '7/16 Important Change Notice', status: 'ClICKED', date: '11/03/2016' }),
    //     new MemberActivity({ subjectLine: 'Browser Optimisation', status: 'READ', date: '11/03/2016' }),
    //     new MemberActivity({ subjectLine: 'Major new features', status: 'READ', date: '11/03/2016' }),
    //     new MemberActivity({ subjectLine: '7/16 Important Change Notice', status: 'READ', date: '11/03/2016' }),
    //     new MemberActivity({ subjectLine: 'Deskpro Apps Newsletter 9', status: 'UNREAD', date: '11/03/2016' }),
    //     new MemberActivity({ subjectLine: 'Browser Optimisation', status: 'READ', date: '11/03/2016' }),
    //     new MemberActivity({ subjectLine: 'Major new features', status: 'READ', date: '11/03/2016' }),
    //     new MemberActivity({ subjectLine: '7/16 Important Change Notice', status: 'READ', date: '11/03/2016' }),
    //     new MemberActivity({ subjectLine: 'Must scroll to view it', status: 'UNREAD', date: '11/03/2016' }),
    //   ],
    // };

  };

  componentDidMount()
  {
    this.getMailchimpAuth()
      .then(authc => { //normalize result
        if (!authc) { return null; }
        if (authc.oauth2Token || authc.apiKey) { return authc; }
        return null;
      })
      .then(this.onRetrieveMailchimpAuthc)
      .catch(e => {
        console.log('error', e);
      })
  }

  loadData = () =>
  {
    const { mailchimpAuth } = this.state;
    const authcInfo = new MailchimpAuthcInfo(mailchimpAuth);
    const { apiKey: key } = authcInfo;

    const { fetchCORS: fetch } = this.props.dpapp.restApi;
    const client = new MailchimpFetchClient({ key, fetch });

    const { context } = this.props.dpapp;
    context.getTabData()
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
      })
  };

  getMailchimpAuth = () =>
  {
    const { appState } = this.props.dpapp;

    return appState.asyncGetPrivate('settings')
      .then(state => {
        return !state ? null : state;
      })
      .catch(err => {
        console.log('got error', err);
        return err;
      })
      .then(result => {
        if (result instanceof Error || result === null) { return null; }
        return new MailchimpAuthcInfo(result);
      });
  };

  /**
   * @param {MailchimpAuthcInfo} mailchimpAuthc
   * @return {Promise.<T>}
   */
  updateMailchimpAuth = (mailchimpAuthc) =>
  {
    const { appState } = this.props.dpapp;

    return appState
      .asyncSetPrivate('settings', mailchimpAuthc.toJS())
      .catch(err => {
        console.log('got error', err);
        return err;
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
  onRetrieveMailchimpAuthc = authc =>
  {
    const stateUpdate = authc ? { activeView: 'home', mailchimpAuth: authc.toJS() } : { activeView: 'authenticate' };
    this.setState(stateUpdate);

    if (authc) {
      return this.loadData().then(() => authc);
    }

    return Promise.resolve(authc);
  };

  /**
   * @param {String} apiKey
   * @return {Promise.<String>}
   */
  onNewMailchimpAPIKey = apiKey =>
  {
    const { dataLoadedTimestamp } = this.state;

    // TODO try first the key
    const authc = new MailchimpAuthcInfo({apiKey: apiKey});
    return this.updateMailchimpAuth(authc)
      .then(state => this.setState({ activeView: 'home', mailchimpAuth: authc.toJS() }))
      .then(() => {
        if (!dataLoadedTimestamp) {
          return this.loadData();
        }
      })
      .then(() => apiKey)
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
