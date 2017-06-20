import {parseLists, parseListMemberInfoList, parseMemberActivityLinks, parseMemberActivityList} from './Parsers'
import {SubscriptionStatus} from '../Domain'

const promiseReflect = promise => promise.then(value => ({ value, status: 'resolved' }), error => ({ error, status: 'rejected' }));

/**
 * @param {Array} results
 */
const retainResolved = results =>
{
  const reducer = (acc, result) => {
    if (result.status === 'resolved') {
      acc.push(result.value);
    }

    return acc;
  };

  return results.reduce(reducer, []);
};

/**
 * @param {FetchClient} client
 * @return {Promise.<Array<List>>}
 */
export const fetchLists = client =>
{
  return client.fetch('/lists?fields=lists.id,lists.web_id,lists.name', { method: 'GET' })
    .then(response => response.body.lists)
    .then(parseLists);
};

/**
 *
 * @param {FetchClient} client
 * @param {String} email
 * @return {Promise}
 */
export const fetchMemberInfo = (client, email) =>
{
  return client.fetch(`/search-members?query=${email}`, { method: 'GET' })
    .then(response => response.body.exact_matches.members)
    .then(members => {
      //TODO error handling

      const memberActivityListPromises = parseMemberActivityLinks(members)
          .map(url => client.fetch(url, { method: 'GET' }))
          .map(promiseReflect)
        ;

      const memberActivityList = Promise
          .all(memberActivityListPromises)
          .then(retainResolved)
          .then(responses => responses.map(response => response.body.activity).reduce((acc, list) => acc.concat(list), []))
          .then(parseMemberActivityList)
        ;

      return Promise.all([
        memberActivityList,
        Promise.resolve(parseListMemberInfoList(members)), // memberInfoList
      ].map(promiseReflect)).then(retainResolved);
    });
};

/**
 * @param {Array<ListMember>} listMembers
 * @return {number}
 */
export const determineAverageRating = listMembers =>
{
  if (listMembers.length === 0) {
    return 0;
  }

  const avg = listMembers.reduce((acc, member) => acc + member.rating, 0) / listMembers.length;
  return Math.round(avg);
};

/**
 * @param {Array<List>} lists
 * @param {Array<ListMember>} listMembers
 * @return {Array<SubscriptionStatus>}
 */
export const determineSubscriptions = (lists, listMembers) => {

  const listIds = listMembers.map(listMember => listMember.listId);
  const mapper = list => {
    const {id, name} = list;
    const isSubscribed = listIds.indexOf(list.id) !== -1;

    return new SubscriptionStatus({ id, name, isSubscribed });
  };

  return lists.map(mapper);
};