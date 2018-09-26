import React from 'react';
import PropTypes from 'prop-types';
import { ActionBar, Level, List, ListItem, Panel } from '@deskpro/apps-components';

const renderEmpty = () =>
{
  return (
      <ListItem>
        <ActionBar title={"User & Rating"}/>

        <Level>
          <span>No information available yet</span>
        </Level>
      </ListItem>
  );
};

/**
 * @param {SubscriberDetails} memberDetails
 * @return {XML}
 */
const renderNormal = ({ memberDetails }) =>
{
  return (
      <Panel title={"User & Rating"}>

        <Level>
          <Level align={"left"}>
            <span>{memberDetails.fullName}</span>
          </Level>

          <Level align={"right"}>
            <span className="star-rating">
              <input type="radio" name="rating" value="1" checked={1 === memberDetails.rating } readOnly={true} /><i/>
              <input type="radio" name="rating" value="2" checked={2 === memberDetails.rating } readOnly={true} /><i/>
              <input type="radio" name="rating" value="3" checked={3 === memberDetails.rating } readOnly={true} /><i/>
              <input type="radio" name="rating" value="4" checked={ 4 === memberDetails.rating } readOnly={true} /><i/>
              <input type="radio" name="rating" value="5" checked={ 5 === memberDetails.rating } readOnly={true} /><i/>
          </span>
          </Level>
        </Level>

        <Level>
          <Level align={"left"}>
            <span>{memberDetails.email}</span>
          </Level>
        </Level>
      </Panel>
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
  subscriberDetails: PropTypes.object,
};


