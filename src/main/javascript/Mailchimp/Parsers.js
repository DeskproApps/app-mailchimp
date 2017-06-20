import {MemberActivity} from '../Domain'
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
export const parseListMemberInfoList = mailchimpAPIList =>
{
  const mapper = info => {
    const {vip, member_rating: rating, list_id: listId, email_address: email} = info;
    return new ListMember({ email, rating, vip, listId });
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

/**
 * @param {Array<{}>} mailchimpAPIList
 * @return {Array<MemberActivity>}
 */
export const parseMemberActivityList = mailchimpAPIList =>
{
  const mapper = activity => {
    const { action: status, timestamp, title: subjectLine } = activity;

    const date = new Date(timestamp);
    const formattedDate = [
      `0${date.getDate()}`.substr(-2)
      , `0${date.getMonth()}`.substr(-2)
      , date.getFullYear()
    ].join('/');

    return new MemberActivity({ subjectLine, status, date: formattedDate  });
  };

  return mailchimpAPIList.map(mapper);
};