import React from 'react';
import { Form, Input, Button, validators } from '@deskpro/react-components/lib/bindings/redux-form';
import { Container, Section, Heading } from '@deskpro/react-components';
import { Input as InputReadOnly } from '@deskpro/react-components';

const updateProviderDetailsDOM = (providerDetailsDisplay, labelDOM, providerDetailsDOM) =>
{
  if (providerDetailsDisplay === 'none') {
    labelDOM.innerHTML = 'SHOW DETAILS'
  } else {
    labelDOM.innerHTML = 'HIDE DETAILS';
  }

  providerDetailsDOM.style.display = providerDetailsDisplay;

};

export const OauthConnectionView = ({ onAddConnection, model }) => {
  const onSubmitHandler = (model) => {
    onAddConnection(model);
  };

  let providerDetailsDisplay = 'none';
  let providerDetailsDOM = null;
  let urlRedirectDOM = null;
  const onToggleProviderDetails = (e) => {
    providerDetailsDisplay = providerDetailsDisplay === 'none' ? 'block' : 'none';
    updateProviderDetailsDOM(providerDetailsDisplay, e.target, providerDetailsDOM)
  };

  const copy = (e) => {
    urlRedirectDOM.select();
    document.execCommand("copy");
    urlRedirectDOM.blur();
  };

  return (
    <Container>
      <Heading size={3}>
        Create OAuth Connection
      </Heading>
      <p>
        This seems to be the first time you are running the application.
      </p>
      <p>
        Login into your {model.providerDisplayName} account and register a new oauth app
      </p>

      <Form name="auth" initialValues={model} onSubmit={onSubmitHandler}>
        <div className="dp-form-group">
          <label>
            <span>Provider Name</span>
            <a
              href="#"
              style={{float: 'right', fontWeight: 800}}
              onClick={onToggleProviderDetails}
              className="text small"
            >
              SHOW DETAILS
            </a>
          </label>
          <InputReadOnly
            type="text"
            name="providerDisplayName"
            value={ model.providerDisplayName }
            readOnly
          />
        </div>
        <div style={{display: providerDetailsDisplay}} ref={(dom) => {providerDetailsDOM = dom;}}>
          <Section>
            <Input
              label="Authorize URL"
              id="urlAuthorize"
              name="urlAuthorize"
              validate={validators.required}
            />
            <Input
              label="Access Token URL"
              id="urlAccessToken"
              name="urlAccessToken"
              validate={validators.required}
            />
            <Input
              label="Resource Owner Details URL"
              id="urlResourceOwnerDetails"
              name="urlResourceOwnerDetails"
              validate={validators.required}
            />
          </Section>
        </div>
        <div className="dp-form-group">
          <label>
            Return URL
            <a href="#" style={{float: 'right', fontWeight: 800}} className="text small" onClick={copy}>COPY</a>
          </label>
          <InputReadOnly
            type="text"
            name="urlRedirect"
            value={ model.urlRedirect }
            ref={(dom) => {urlRedirectDOM = dom;}}
            readOnly
          />
        </div>
        <Input
          label="Client ID"
          id="clientId"
          name="clientId"
          validate={validators.required}
        />
        <Input
          label="Client Secret"
          id="clientSecret"
          name="clientSecret"
          validate={validators.required}
        />
        <Button>
          Create
        </Button>
      </Form>
    </Container>
  );
};

OauthConnectionView.defaultProps = {
  model: {}
};

OauthConnectionView.propTypes = {
  onAddConnection: React.PropTypes.func.isRequired,
  model: React.PropTypes.object
};