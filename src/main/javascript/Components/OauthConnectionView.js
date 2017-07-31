import React from 'react';
import {Form, Layout} from "@deskproapps/deskproapps-sdk-react";

/**
 * @return {{providerName: {schema: {type: String, optional: boolean}, ui: {label: string}}, urlAuthorize: {schema: {type: String, optional: boolean}, ui: {label: string}}, urlAccessToken: {schema: {type: String, optional: boolean}, ui: {label: string}}, urlResourceOwnerDetails: {schema: {type: String, optional: boolean}, ui: {label: string}}, clientId: {schema: {type: String, optional: boolean}, ui: {label: string}}, clientSecret: {schema: {type: String, optional: boolean}, ui: {label: string}}}}
 */
const getFieldsDefinition = () => {
  return {
    providerName: {
      schema: {
        type: String,
        optional: false
      },
      ui: {
        label: 'Provider name'
      }
    },
    urlRedirect: {
      schema: {
        type: String,
        optional: false
      },
      ui: {
        label: 'Return URL'
      }
    },
    urlAuthorize: {
      schema: {
        type: String,
        optional: false
      },
      ui: {
        label: 'Authorize URL'
      }
    },
    urlAccessToken: {
      schema: {
        type: String,
        optional: false
      },
      ui: {
        label: 'Access Token URL'
      }
    },
    urlResourceOwnerDetails: {
      schema: {
        type: String,
        optional: false
      },
      ui: {
        label: 'Resource Owner Details URL'
      }
    },
    clientId: {
      schema: {
        type: String,
        optional: false
      },
      ui: {
        label: 'Client ID'
      }
    },
    clientSecret: {
      schema: {
        type: String,
        optional: false
      },
      ui: {
        label: 'Client Secret'
      }
    }
  };
};


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

  const fields = getFieldsDefinition();
  const onSubmitHandler = (model) => {
    onAddConnection(model);
  };
  const onCancelHandler = () => {};

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
    <Layout.Section title="CREATE OAUTH CONNECTION">
      <p>
        This seems to be the first time you are running the application.
      </p>
      <p>
        Login into your {model.providerDisplayName} account and register a new oauth app
      </p>

      <Form.Form
        fields={fields}
        model={ model }
        submitLabel={"Create"}
        onSubmit={onSubmitHandler}
        onCancel={onCancelHandler}
      >

        <div className="field">
          <label><span>Provider Name</span> <a href="#" style={{float: 'right', fontWeight: 800}} onClick={onToggleProviderDetails} className="text small">SHOW DETAILS</a> </label>
          <input type="text" readonly="" name="providerDisplayName" placeholder="" value={ model.providerDisplayName } />
        </div>

        <div style={{display: providerDetailsDisplay}} ref={(dom) => {providerDetailsDOM = dom;}}>
          <Layout.Block>
            <Form.Fields fields={[
              'urlAuthorize',
              'urlAccessToken',
              'urlResourceOwnerDetails'
            ]} />
          </Layout.Block>
        </div>

        <div className="field">
          <label>Return URL <a href="#" style={{float: 'right', fontWeight: 800}} className="text small" onClick={copy}>COPY</a> </label>
          <input type="text" readonly="" name="urlRedirect" placeholder="" value={ model.urlRedirect } ref={(dom) => {urlRedirectDOM = dom;}} />
        </div>

        <Form.Fields fields={[
          'clientId',
          'clientSecret'
        ]} />

      </Form.Form>

    </Layout.Section>
  );
};

OauthConnectionView.defaultProps = {
  model: {}
};

OauthConnectionView.propTypes = {
  onAddConnection: React.PropTypes.func.isRequired,
  model: React.PropTypes.object
};