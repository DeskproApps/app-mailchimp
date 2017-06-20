import React from 'react';

import { MemberActivityList } from './CampaignsSection'
import { SubscriptionsList } from './SubscriptionsSection'
import { UserCard } from './UserCardSection'

/**
 * @param {MemberInfo} memberInfo
 * @param {Array<SubscriptionStatus>} subscriptionStatusList
 * @param {Array<MemberActivity>} memberActivityList
 * @constructor
 */
export const HomeView = ({ memberInfo, subscriptionStatusList, memberActivityList }) => {
  return (
    <div>
      <UserCard memberInfo={memberInfo} />
      <SubscriptionsList statusList={subscriptionStatusList} />
      <MemberActivityList activityList={memberActivityList} />
    </div>
  );
};