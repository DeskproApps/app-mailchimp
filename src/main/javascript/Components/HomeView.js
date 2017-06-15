import React from 'react';

import { CampaignActivityList } from './CampaignActivityListSection'
import { SubscriptionsList } from './SubscriptionsListSection'
import { UserCard } from './UserCardSection'

/**
 * @param {MemberInfo} memberInfo
 * @param {Array<SubscriptionStatus>} subscriptionStatusList
 * @param {Array<CampaignActivity>} campaignActivityList
 * @constructor
 */
export const HomeView = ({ memberInfo, subscriptionStatusList, campaignActivityList }) => {
  return (
    <div>
      <UserCard memberInfo={memberInfo} />
      <SubscriptionsList statusList={subscriptionStatusList} />
      <CampaignActivityList activityList={campaignActivityList} />
    </div>
  );
};