import {SubscriberDetails} from '../Domain'

export const parseSubscriberDetails = person =>
{
  const { display_name: fullName, emails, primary_email } = person;

  const email = primary_email || emails[0]
  return new SubscriberDetails({email, fullName, rating: 0, vip: false});
};
