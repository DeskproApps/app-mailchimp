import React from 'react';
import ReactDOM from 'react-dom';

import { CampaignActivityList, UserCard, SubscriptionsList } from './Components'
import { CampaignActivity, MemberInfo, SubscriptionStatus } from './Domain'

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
      memberInfo: new MemberInfo({ email: 'zack.prudent@techcompany.com', fullName: 'Zack Prudent', rating: 3 }),
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


  shouldComponentUpdate() { return false; }

  render() {

    const { memberInfo, subscriptionStatusList, campaignActivityList } = this.state;
    return (
      <div>
        <UserCard memberInfo={memberInfo} />
        <SubscriptionsList statusList={subscriptionStatusList} />
        <CampaignActivityList activityList={campaignActivityList} />
      </div>
    );

  }
}
