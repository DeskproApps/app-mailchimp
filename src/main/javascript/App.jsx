import React from 'react';
import ReactDOM from 'react-dom';

import { HomeView, AuthenticationView } from './Components'
import { MemberActivity, MemberInfo, SubscriptionStatus, MailchimpAuthcInfo } from './Domain'

import { MailchimpFetchClient, fetchLists, fetchMemberInfo, determineAverageRating, determineSubscriptions } from './Mailchimp';
import { parseMemberInfo } from './Deskpro';

export default class App extends React.Component
{
  static propTypes = { dpapp: React.PropTypes.object.isRequired };

  constructor(props) {
    super(props);
    this.initState();
  }

  initState = () => {
    this.state = {
      activeView: '',
      mailchimpAuth: new MailchimpAuthcInfo({}).toJS(),
      memberInfo: null,
      subscriptionStatusList: [],
      memberActivityList: [],
    };

    // const dummyDataState = {
    //   memberInfo: new MemberInfo({ email: 'zack.prudent@techcompany.com', fullName: 'Zack Prudent', rating: 4 }),
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
      .then(mailchimpAuth => {
        const stateUpdate = mailchimpAuth ? { activeView: 'home', mailchimpAuth: mailchimpAuth.toJS() } : { activeView: 'authenticate' };
        this.setState(stateUpdate);

        return mailchimpAuth;
      })
      .then(mailchimpAuth => {
        if (mailchimpAuth) {
          return this.getInfo();
        }
      })
      .catch(e => {
        console.log('error', e);
      })
  }

  getInfo = () => {
    const { mailchimpAuth } = this.state;
    const authcInfo = new MailchimpAuthcInfo(mailchimpAuth);
    const { apiKey: key } = authcInfo;

    const { fetchCORS: fetch } = this.props.dpapp.restApi;
    const client = new MailchimpFetchClient({ key, fetch });

    const { context } = this.props.dpapp;
    context.getTabData()
      .then(tabData => tabData.api_data.person)
      .then(parseMemberInfo)
      .then(memberInfo => {
        return Promise.all([
          fetchLists(client), fetchMemberInfo(client, memberInfo.email)
        ])
        .then(results => {
          return {memberInfo, lists: results [0], listActivity: results[1][0], listMemberships: results[1][1]};
        });
      })
      .then(({ memberInfo, lists, listActivity, listMemberships }) => {
        const subscriptionStatusList = determineSubscriptions(lists, listMemberships);
        const rating = determineAverageRating(listMemberships);

        const state = {
          subscriptionStatusList,
          memberInfo: memberInfo.changeRating(rating),
          memberActivityList: listActivity
        };
        this.setState(state);
      })
  };

  getMailchimpAuth = () => {
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

        const authc = new MailchimpAuthcInfo(result);
        if (authc.oauth2Token || authc.apiKey) { return authc; }

        return null;
      });
  };

  /**
   * @param {MailchimpAuthcInfo} mailchimpAuthc
   * @return {Promise.<T>}
   */
  updateMailchimpAuth = (mailchimpAuthc) => {
    const { appState } = this.props.dpapp;

    return appState
      .asyncSetPrivate('settings', mailchimpAuthc.toJS())
      .then(state => this.setState({ activeView: 'home', mailchimpAuth: mailchimpAuthc.toJS() }))
      .catch(err => {
        console.log('got error', err);
        return err;
      });

  };

  onNewMailchimpAPIKey = apiKey => {
    // TODO try first the key
    const authc = new MailchimpAuthcInfo({apiKey: apiKey});
    this.updateMailchimpAuth(authc);
  };

  renderAuthenticationView = () => {
    return (<AuthenticationView onAuthenticate={this.onNewMailchimpAPIKey} />)
  };

  renderHomeView = () => {
    const { memberInfo, subscriptionStatusList, memberActivityList } = this.state;
    return (<HomeView  memberInfo={memberInfo} subscriptionStatusList={subscriptionStatusList} memberActivityList={memberActivityList} />)
  };

  render() {

    const { activeView } = this.state;

    if (activeView === 'home') { return this.renderHomeView(); }

    if (activeView === 'authenticate') { return this.renderAuthenticationView(); }

    return (<noscript/>);

  }
}
