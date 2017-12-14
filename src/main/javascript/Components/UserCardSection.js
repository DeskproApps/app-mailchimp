import React from 'react';
import { Container, Section, Heading } from '@deskpro/react-components';


const renderEmpty = () =>
{
  return (
    <Container>
      <Heading size={3}>
        User &amp; Rating
      </Heading>
      <Section>
        <div>No member information available yet</div>
      </Section>
    </Container>
  );
};

/**
 * @param {SubscriberDetails} memberDetails
 * @return {XML}
 */
const renderNormal = ({ memberDetails }) =>
{
  return (
    <Container>
      <Heading size={3}>
        User &amp; Rating
      </Heading>

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

    </Container>
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


