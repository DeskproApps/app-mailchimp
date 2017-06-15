import React from 'react';
import ReactDOM from 'react-dom';

import { HomeView, AuthenticationView } from './Components'
import { CampaignActivity, MemberInfo, SubscriptionStatus, MailchimpAuthcInfo } from './Domain'
import MailchimpClient  from 'mailchimp-v3-api';

export default class App extends React.Component
{
  static propTypes = { dpapp: React.PropTypes.object.isRequired };

  constructor(props) {
    super(props);

    const key = '5312374d765bb50efd7a7c3ba1b9bbae-us16';

    this.initState();
  }

  initState = () => {
    this.state = {
      activeView: '',
      mailchimpAuth: new MailchimpAuthcInfo({}).toJS(),
      memberInfo: new MemberInfo({ email: 'zack.prudent@techcompany.com', fullName: 'Zack Prudent', rating: 4 }),
      subscriptionStatusList: [
        new SubscriptionStatus({ id: 1, name : 'iPhone 6s & Plus SDK Issue', isSubscribed: false })
        , new SubscriptionStatus({ id: 2, name : 'All Hercules Developers', isSubscribed: true })
        , new SubscriptionStatus({ id: 3, name : 'Deskpro Developers', isSubscribed: false })
        , new SubscriptionStatus({ id: 4, name : 'List no. 4', isSubscribed: false })
        , new SubscriptionStatus({ id: 5, name : 'List no. 5', isSubscribed: false })

      ],
      campaignActivityList: [
        new CampaignActivity({ subjectLine: 'Schedules API', status: 'DELIVERED', date: '11/03/2016' }),
        new CampaignActivity({ subjectLine: 'API Breaking Changes: DELETE Response code change', status: 'READ', date: '11/03/2016' }),
        new CampaignActivity({ subjectLine: 'Deskpro Apps Newsletter 9', status: 'READ', date: '03/02/2016' }),
        new CampaignActivity({ subjectLine: 'Browser Optimisation', status: 'READ', date: '11/03/2016' }),
        new CampaignActivity({ subjectLine: 'Major new features', status: 'READ', date: '11/03/2016' }),
        new CampaignActivity({ subjectLine: '7/16 Important Change Notice', status: 'ClICKED', date: '11/03/2016' }),
        new CampaignActivity({ subjectLine: 'Browser Optimisation', status: 'READ', date: '11/03/2016' }),
        new CampaignActivity({ subjectLine: 'Major new features', status: 'READ', date: '11/03/2016' }),
        new CampaignActivity({ subjectLine: '7/16 Important Change Notice', status: 'READ', date: '11/03/2016' }),
        new CampaignActivity({ subjectLine: 'Deskpro Apps Newsletter 9', status: 'UNREAD', date: '11/03/2016' }),
        new CampaignActivity({ subjectLine: 'Browser Optimisation', status: 'READ', date: '11/03/2016' }),
        new CampaignActivity({ subjectLine: 'Major new features', status: 'READ', date: '11/03/2016' }),
        new CampaignActivity({ subjectLine: '7/16 Important Change Notice', status: 'READ', date: '11/03/2016' }),
        new CampaignActivity({ subjectLine: 'Must scroll to view it', status: 'UNREAD', date: '11/03/2016' }),
      ],
    }
  };

  componentDidMount() {

    this.getMailchimpAuth()
      .then(mailchimpAuth => {
        const stateUpdate = mailchimpAuth ? { activeView: 'home', mailchimpAuth: mailchimpAuth.toJS() } : { activeView: 'authenticate' };
        this.setState(stateUpdate);

        return mailchimpAuth;
      })
    ;

  // .then(mailchimpAuth => {
  //
  //     const client = new MailchimpClient({ key: mailchimpAuth.apiKey });
  //
  //     return client.get('/lists')
  //       .then(function(response){
  //         console.log('got response from mailchimp');
  //         console.log(response);
  //       })
  //   })

  }

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
    const { memberInfo, subscriptionStatusList, campaignActivityList } = this.state;
    return (<HomeView  memberInfo={memberInfo} subscriptionStatusList={subscriptionStatusList} campaignActivityList={campaignActivityList} />)
  };

  render() {

    const { activeView } = this.state;

    if (activeView === 'home') { return this.renderHomeView(); }

    if (activeView === 'authenticate') { return this.renderAuthenticationView(); }

    return (<noscript/>);

  }
}
