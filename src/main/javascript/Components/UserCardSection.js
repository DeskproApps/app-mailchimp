import React from 'react';
import { Layout } from '@deskproapps/deskproapps-sdk-react';


const renderEmpty = () =>
{
  return (
    <Layout.Section title="USER & RATING">
      <Layout.Block>
        <div>No member information available yet</div>
      </Layout.Block>
    </Layout.Section>
  );
};

/**
 * @param {SubscriberDetails} memberDetails
 * @return {XML}
 */
const renderNormal = ({ memberDetails }) =>
{
  return (
    <Layout.Section title="USER & RATING">
      <Layout.Block>
        <div style={{ float: 'left' }}> {memberDetails.fullName} </div>
        <div style={{ float: 'right' }}>
          <span className="star-rating">
            <input type="radio" name="rating" value="1" checked={1 === memberDetails.rating } readOnly={true} /><i/>
            <input type="radio" name="rating" value="2" checked={2 === memberDetails.rating } readOnly={true} /><i/>
            <input type="radio" name="rating" value="3" checked={3 === memberDetails.rating } readOnly={true} /><i/>
            <input type="radio" name="rating" value="4" checked={ 4 === memberDetails.rating } readOnly={true} /><i/>
            <input type="radio" name="rating" value="5" checked={ 5 === memberDetails.rating } readOnly={true} /><i/>
          </span>
        </div>
        <div style={{ clear: 'all' }}>{memberDetails.email}</div>
      </Layout.Block>
    </Layout.Section>
  );
};

/**
 * @param {SubscriberDetails} memberDetails
 * @return {XML}
 * @constructor
 */
export const UserCard = ({ memberDetails }) => {

  if (!memberDetails) {
    return renderEmpty();
  }

  return renderNormal({ memberDetails });
};

UserCard.propTypes = {
  subscriberDetails: React.PropTypes.object,
};


