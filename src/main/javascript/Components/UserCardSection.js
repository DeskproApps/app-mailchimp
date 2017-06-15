import React from 'react';
import { Layout } from '@deskproapps/deskproapps-sdk-react';

/**
 * @param {MemberInfo} memberInfo
 * @return {XML}
 * @constructor
 */
export const UserCard = ({ memberInfo }) => {

  return (
    <Layout.Section title="USER & RATING">
      <Layout.Block>
        <div style={{ float: 'left' }}> {memberInfo.fullName} </div>
        <div style={{ float: 'right' }}>
          <span className="star-rating">
            <input type="radio" name="rating" value="1" checked={1 === memberInfo.rating } readOnly={true} /><i/>
            <input type="radio" name="rating" value="2" checked={2 === memberInfo.rating } readOnly={true} /><i/>
            <input type="radio" name="rating" value="3" checked={3 === memberInfo.rating } readOnly={true} /><i/>
            <input type="radio" name="rating" value="4" checked={ 4 === memberInfo.rating } readOnly={true} /><i/>
            <input type="radio" name="rating" value="5" checked={ 5 === memberInfo.rating } readOnly={true} /><i/>
          </span>
        </div>
        <div style={{ clear: 'all' }}>{memberInfo.email}</div>
      </Layout.Block>
    </Layout.Section>
  );
};

UserCard.propTypes = {
  memberInfo: React.PropTypes.object.isRequired,
};


