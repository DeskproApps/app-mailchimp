import ErrorWrapper from 'error-wrapper';

export class AuthenticationError extends ErrorWrapper {
  constructor(message, originalError, httpResponse) {
    super(message, originalError);
    this.httpResponse = httpResponse;
  }

  get response() {
    return this.httpResponse;
  }

  get code() {
    return 'MailchimpAuthenticationError';
  }
}

