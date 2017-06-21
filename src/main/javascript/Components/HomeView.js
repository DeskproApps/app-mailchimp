import React from 'react';

import { MemberActivityList } from './CampaignsSection'
import { SubscriptionsList } from './SubscriptionsSection'
import { UserCard } from './UserCardSection'

/**
 * @param {SubscriberDetails} subscriberDetails
 * @param {Array<MembershipDetails>} subscriptionStatusList
 * @param {Array<MemberActivity>} memberActivityList
 * @param {function} onSubscriptionStatusChange
 * @constructor
 */
export const HomeView = ({ subscriberDetails, subscriptionStatusList, memberActivityList, onSubscriptionStatusChange }) => {
  return (
    <div>
      <UserCard memberDetails={subscriberDetails} />
      <SubscriptionsList statusList={subscriptionStatusList} onSubscriptionStatusChange={onSubscriptionStatusChange} />
      <MemberActivityList activityList={memberActivityList} />
    </div>
  );
};

HomeView.propTypes = {
  subscriberDetails: React.PropTypes.object,
  subscriptionStatusList: React.PropTypes.array,
  memberActivityList: React.PropTypes.array,
  onSubscriptionStatusChange: React.PropTypes.func,
};