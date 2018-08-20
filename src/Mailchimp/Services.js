import {parseLists, parseListMemberList, parseMemberActivityLinks, parseMemberActivityList, parseSubscriberDetails} from './Parsers'
import {MembershipDetails} from '../Domain'

const promiseReflect = promise => promise.then(value => ({ value, status: 'resolved' }), error => ({ error, status: 'rejected' }));

const retainOnlyCampaignActivity = memberActivityList => memberActivityList.filter(activity => !!activity.campaignId);

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
 * @param {FetchClient} client
 * @param {SubscriberDetails} subscriber
 * @return {Promise}
 */
export const fetchSubscriberInfo = (client, subscriber) =>
{
  return client.fetch(`/search-members?query=${subscriber.email}`, { method: 'GET' })
    .then(response => response.body.exact_matches.members)
    .then(members => {
      //TODO error handling

      if (!members.length) { // no mailchimp information

        return Promise.all([
          Promise.resolve([]),
          Promise.resolve([]),
          Promise.resolve(subscriber),
        ]);
      }

      const memberActivityListPromises = parseMemberActivityLinks(members)
        .map(url => client.fetch(url, { method: 'GET' }))
        .map(promiseReflect)
      ;

      const memberActivityList = Promise
        .all(memberActivityListPromises)
        .then(retainResolved)
        .then(responses => responses.map(response => response.body.activity).reduce((acc, list) => acc.concat(list), []))
        .then(parseMemberActivityList)
        .then(retainOnlyCampaignActivity)
      ;

      return Promise.all([
        memberActivityList,
        Promise.resolve(parseListMemberList(members)), // memberInfoList,
        Promise.resolve(parseSubscriberDetails(members)).then(details => details ? subscriber.merge(details) : subscriber), // memberDetails
      ].map(promiseReflect)).then(retainResolved);
    });
};

/**
 * @param {FetchClient} client
 * @param {SubscriberDetails} subscriberDetails
 * @param {Array<MembershipDetails>} currentList
 * @param {Array<MembershipDetails>} nextList
 */
export const updateListSubscriptions = (client, subscriberDetails, currentList, nextList) =>
{
  if (currentList.length !== nextList.length) {
    throw new Error('previous and current lists must have the same length');
  }

  const fetchPromises = [];
  const changesSize = currentList.length;
  for (let i = 0; i < changesSize; i++) {
      const previousDetails = currentList[i];
      const currentDetails = nextList[i];

      // no change
      if (previousDetails.subscriberStatus === currentDetails.subscriberStatus) {
        continue;
      }

      let promise;
      const isNew = !previousDetails.isMember();
      if (isNew) {
        promise = client.fetch(
          `/lists/${currentDetails.listId}/members`,
          {
            method: 'POST',
            body: JSON.stringify({
              email_address: subscriberDetails.email , status: currentDetails.subscriberStatus
            })
          }
        );
      } else {
        promise = client.fetch(
          `/lists/${currentDetails.listId}/members/${subscriberDetails.subscriberHash}`,
          { method: 'PATCH', body: JSON.stringify({  status: currentDetails.subscriberStatus }) }
        );
      }

    fetchPromises.push(promise);
  }

  return Promise.all(fetchPromises);
};


/**
 * @param {Array<List>} lists
 * @param {Array<ListMember>} listMembers
 * @return {Array<MembershipDetails>}
 */
export const determineMembershipDetails = (lists, listMembers) =>
{
  const listMemberMap = listMembers.reduce(
    (acc, listMember) => {
      acc[listMember.listId] = listMember;
      return acc;
    }, {});

  const mapper = list => {
    const {id, name: listName} = list;
    const listMember = listMemberMap[id];
    const subscriberStatus = listMember ? listMember.listStatus : 'not-a-member' ;

    return new MembershipDetails({ id, listName, subscriberStatus });
  };

  return lists.map(mapper);
};
