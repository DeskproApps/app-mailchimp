import {MemberActivity, SubscriberDetails} from '../Domain'
import {ListMember, List} from './APIResources'

/**
 * @param {Array<{}>} mailchimpAPIList
 * @return {Array<List>}
 */
export const parseLists = mailchimpAPIList =>
{
  const mapper = info => {
    const {id, web_id: webId, name} = info;
    return new List({ id, webId, name });
  };

  return mailchimpAPIList.map(mapper);
};

/**
 * @param {Array<{}>} mailchimpAPIList
 * @return {Array<ListMember>}
 */
export const parseListMemberList = mailchimpAPIList =>
{
  const mapper = info => {
    const {id, vip, member_rating: rating, list_id: listId, email_address: email, status: listStatus} = info;
    return new ListMember({ id, email, rating, vip, listId, listStatus });
  };

  return mailchimpAPIList.map(mapper);
};

/**
 * @param {Array} mailchimpAPIList
 * @return {Array<String>}
 */
export const parseMemberActivityLinks = mailchimpAPIList =>
{
  const mapper = info => {
    const { _links } = info;
    for (const link of _links) {
      if (link.rel === 'activity') {
        return link.href;
      }
    }

    return null;
  };

  return mailchimpAPIList.map(mapper).filter(href => typeof href === 'string');
};

const reduceActivityList = activityList =>
{
  return activityList.filter(activity => {
    return !activityList.find(a => {
      return a.campaignId === activity.campaignId && a.timestamp > activity.timestamp
    })
  })
};

/**
 * @param {Array<{}>} mailchimpAPIList
 * @return {Array<MemberActivity>}
 */
export const parseMemberActivityList = mailchimpAPIList =>
{
  const mapper = activity => {

    const { action: status, timestamp, title: campaignTitle, campaign_id: campaignId, type: bounceType } = activity;

    const date = new Date(timestamp);
    const formattedDate = [
      `0${date.getDate()}`.substr(-2)
      , `0${date.getMonth()}`.substr(-2)
      , date.getFullYear()
    ].join('/');

    return new MemberActivity({ campaignTitle, status, date: formattedDate, campaignId, bounceType });
  };

  return reduceActivityList(mailchimpAPIList).map(mapper);
};

/**
 * @param {Array<{}>} mailchimpAPIList
 * @return {SubscriberDetails}
 */
export const parseSubscriberDetails = mailchimpAPIList =>
{
  const listMembers = parseListMemberList(mailchimpAPIList);
  if (listMembers.length === 0) { return null; }

  const { id: subscriberHash, email, vip } = listMembers[0];
  const avg = listMembers.reduce((acc, member) => acc + member.rating, 0) / listMembers.length;
  const rating = Math.round(avg);

  return new SubscriberDetails({ subscriberHash, email, rating, vip });
};
