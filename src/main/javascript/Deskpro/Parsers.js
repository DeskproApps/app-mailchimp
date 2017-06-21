import {SubscriberDetails} from '../Domain'

export const parseSubscriberDetails = person =>
{
  const { display_name: fullName, emails, primary_email } = person;

  let email;
  if (primary_email && primary_email.email) {
    email = primary_email.email;
  } else if (emails.length) {
    email = emails[0].email;
  }

  return new SubscriberDetails({email, fullName, rating: 0, vip: false});
};