import PropTypes from 'prop-types';
import React from 'react';
import EmailInput from '../../ui/input/email_input';
import * as c from '../index';
import { swap, updateEntity } from '../../store/index';

import {
  setResolvedConnection,
  connectionResolver,
  loggedIn,
  countConnections,
  hasSomeConnections,
  hasOneConnection,
  connections,
  defaultADUsernameFromEmailPrefix,
  clearGlobalError,
  clearGlobalSuccess,
  connection,
  resolvedConnection,
  findConnection,
  error,
  hasOnlyConnections,
  prefill,
  hasStopped,
  hasConnection,
  ui,
  runHook,
  filterConnections,
  clientID,
  submitting,
  hashCleanup,
  clientBaseUrl,
  tenantBaseUrl,
  useTenantInfo,
  loginErrorMessage,
  setGlobalSuccess,
  setCaptcha,
  setSubmitting,
  captcha,
  emitEvent,
  languageBaseUrl,
  warn,
  suppressSubmitOverlay,
  stopRendering,
  stop,
  showBadge,
  setSupressSubmitOverlay,
  setLoggedIn,
  setGlobalInfo,
  setGlobalError,
  reset,
  rendering,
  render,
  overrideOptions,
  handleEvent,
  globalSuccess,
  globalInfo,
  globalError,
  extractTenantBaseUrlOption,
  emitUnrecoverableErrorEvent,
  emitHashParsedEvent,
  emitAuthorizationErrorEvent,
  emitAuthenticatedEvent,
  domain,
  clearGlobalInfo,
  auth,
  allowedConnections,
  id,
  withAuthOptions,
  setup
} from '../../core/index';
import { setEmail } from '../email';
import { debouncedRequestAvatar, requestAvatar } from '../../avatar';

export default class EmailPane extends React.Component {
  componentDidMount() {
    const { lock, strictValidation } = this.props;
    if (ui.avatar(lock) && c.email(lock)) {
      requestAvatar(id(lock), c.email(lock));
    }

    swap(updateEntity, 'lock', id(lock), setEmail, c.email(lock), strictValidation);
  }

  handleChange(e) {
    const { lock, strictValidation } = this.props;
    if (ui.avatar(lock)) {
      debouncedRequestAvatar(id(lock), e.target.value);
    }

    swap(updateEntity, 'lock', id(lock), setEmail, e.target.value, strictValidation);
  }

  render() {
    const { i18n, lock, placeholder, forceInvalidVisibility = false } = this.props;
    const allowAutocomplete = ui.allowAutocomplete(lock);

    const field = c.getField(lock, 'email');
    const value = field.get('value', '');
    const valid = field.get('valid', true);

    // TODO: invalidErrorHint and blankErrorHint are deprecated.
    // They are kept for backwards compatibiliy in the code for the customers overwriting
    // them with languageDictionary. They can be removed in the next major release.
    const errMessage = value
      ? i18n.str('invalidErrorHint') || i18n.str('invalidEmailErrorHint')
      : i18n.str('blankErrorHint') || i18n.str('blankEmailErrorHint');
    const invalidHint = field.get('invalidHint') || errMessage;

    let isValid = (!forceInvalidVisibility || valid) && !c.isFieldVisiblyInvalid(lock, 'email');
    // Hide the error message for the blank email in Enterprise HRD only mode when the password field is hidden.
    isValid = forceInvalidVisibility && value === '' ? true : isValid;

    return (
      <EmailInput
        lockId={id(lock)}
        value={value}
        invalidHint={invalidHint}
        isValid={isValid}
        onChange={::this.handleChange}
        placeholder={placeholder}
        autoComplete={allowAutocomplete}
      />
    );
  }
}

EmailPane.propTypes = {
  i18n: PropTypes.object.isRequired,
  lock: PropTypes.object.isRequired,
  placeholder: PropTypes.string.isRequired,
  strictValidation: PropTypes.bool.isRequired
};
