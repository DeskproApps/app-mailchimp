import React from 'react';
import { UserCard } from "./UserCardSection";
import { SubscriptionsList } from "./SubscriptionsSection";
import { MemberActivityList } from "./CampaignsSection";

class AppPlaceholder extends React.PureComponent
{
  render() {
    return [
      <UserCard />,
      <SubscriptionsList statusList={[]} size={0} />,
      <MemberActivityList activityList={[]} />
    ];
  }
}

export default AppPlaceholder;
