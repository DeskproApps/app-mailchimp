import React from 'react'
import { Field, reduxForm, reducer as reduxFormReducer } from 'redux-form'
import { Provider } from "react-redux";
import { createStore, combineReducers } from 'redux';
import { Button } from '@deskpro/apps-components';

const reducer = combineReducers({
  form: reduxFormReducer, // mounted under "form"
});
const store = createStore(reducer);

let urlRedirectRef = React.createRef();
const copyURLRedirect = (e) => {
  urlRedirectRef.current.select();
  document.execCommand("copy");
  urlRedirectRef.current.blur();
};

const required = value => value ? undefined : 'Required';

const renderInputField = ({ input, label, type, meta: { touched, error, warning } }) => (
  <div className={"dp-forminput"}>
    <label className={"dp-forminput__label"}>{label}</label>
    <div>
      <input {...input} placeholder={label} type={type}/>
      {touched && ((error && <span>{error}</span>) || (warning && <span>{warning}</span>))}
    </div>
  </div>
);


class Form extends React.Component
{
  state = {
    displayProviderDetails : false
  };

  onToggleProviderDetails = () => {
    this.setState({displayProviderDetails: !this.state.displayProviderDetails})
  };

  render() {
    const { handleSubmit, providerDisplayName, urlRedirect } = this.props;
    const { displayProviderDetails } = this.state;

    return(
      <form onSubmit={handleSubmit} className={"dp-form"}>
        <div className={"dp-forminput"}>
          <label className={"dp-forminput__label"}>
            <span>Provider Name</span>
            <a
              href="#"
              style={{float: 'right', fontWeight: 800}}
              onClick={this.onToggleProviderDetails}
            >
              SHOW DETAILS
            </a>
          </label>
          <input
            type=   "text"
            name=   "providerDisplayName"
            value=  { providerDisplayName }
            readOnly
          />
        </div>
        <div style={{display: displayProviderDetails ? 'block' : 'none'}}>
          <Field
            name=       "urlAuthorize"
            component=  {renderInputField}
            label=      {"Authorize URL"}
            type=       "text"
            validate=   {[ required ]}
          />

          <Field
            name=       "urlAccessToken"
            component=  {renderInputField}
            label=      {"Access Token URL"}
            type=       "text"
            validate=   {[ required ]}
          />

          <Field
            name=       "urlResourceOwnerDetails"
            component=  {renderInputField}
            label=      {"Resource Owner Details URL"}
            type=       "text"
            validate=   {[ required ]}
          />
        </div>
        <div className={"dp-forminput"}>
          <label className={"dp-forminput__label"}>
            Return URL
            <a href="#" style={{float: 'right', fontWeight: 800}} className="text small" onClick={copyURLRedirect}>COPY</a>
          </label>
          <input
            type=   "text"
            name=   "urlRedirect"
            value=  { urlRedirect }
            ref=    { urlRedirectRef }
            readOnly
          />
        </div>
        <Field
          name=       "clientId"
          component=  {renderInputField}
          label=      {"Client ID"}
          type=       "text"
          validate=   {[ required ]}
        />
        <Field
          name=       "clientSecret"
          component=  {renderInputField}
          label=      {"Client Secret"}
          type=       "text"
          validate=   {[ required ]}
        />

        <div>
          <Button type="submit" appearance={"primary"}>Submit</Button>
        </div>

      </form>
    );
  }
}

const ConnectedForm = reduxForm({
  form: 'simple', // a unique identifier for this form,
  enableReinitialize: true
})(Form);

const component = (props) => (<Provider store={store}><ConnectedForm {...props}/></Provider>);
export default component;


