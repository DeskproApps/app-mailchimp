import React from 'react';
import PropTypes from 'prop-types';
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
  return [
      <UserCard memberDetails={subscriberDetails} />,
      <SubscriptionsList statusList={subscriptionStatusList} onSubscriptionStatusChange={onSubscriptionStatusChange} />,
      <MemberActivityList activityList={memberActivityList} />
  ];
};

HomeView.propTypes = {
  subscriberDetails:          PropTypes.object,
  subscriptionStatusList:     PropTypes.array,
  memberActivityList:         PropTypes.array,
  onSubscriptionStatusChange: PropTypes.func,
};
