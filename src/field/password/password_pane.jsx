import PropTypes from 'prop-types';
import React from 'react';
import PasswordInput from '../../ui/input/password_input';
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
import { setPassword, setShowPassword } from '../password';

export default class PasswordPane extends React.Component {
  handleChange = e => {
    const { lock, policy } = this.props;
    swap(updateEntity, 'lock', id(lock), setPassword, e.target.value, policy);
  };
  handleShowPasswordChange = e => {
    const { lock } = this.props;
    swap(updateEntity, 'lock', id(lock), setShowPassword, e.target.checked);
  };

  render() {
    const { i18n, lock, placeholder, policy, strengthMessages, hidden } = this.props;
    const hiddenCss = hidden ? ' auth0-lock-hidden' : '';

    // TODO: invalidErrorHint and blankErrorHint are deprecated.
    // They are kept for backwards compatibiliy in the code for the customers overwriting
    // them with languageDictionary. They can be removed in the next major release.
    const invalidHint = c.getFieldValue(lock, 'password')
      ? i18n.str('invalidErrorHint') || i18n.str('invalidPasswordErrorHint')
      : i18n.str('blankErrorHint') || i18n.str('blankPasswordErrorHint');
    return (
      <div className={`auth0-lock-input-block auth0-lock-input-show-password${hiddenCss}`}>
        <PasswordInput
          value={c.getFieldValue(lock, 'password')}
          invalidHint={invalidHint}
          showPasswordStrengthMessage={!c.isFieldValid(lock, 'password')}
          isValid={!c.isFieldVisiblyInvalid(lock, 'password')}
          onChange={this.handleChange}
          placeholder={placeholder}
          strengthMessages={strengthMessages}
          disabled={submitting(lock)}
          policy={policy}
          showPassword={c.getFieldValue(lock, 'showPassword', false)}
          lock={lock}
        />
        {ui.allowShowPassword(lock) && (
          <div className="auth0-lock-show-password">
            <input type="checkbox" id="slideOne" onChange={this.handleShowPasswordChange} />
            <label htmlFor="slideOne" title={i18n.str('showPassword')} />
          </div>
        )}
      </div>
    );
  }
}

PasswordPane.propTypes = {
  i18n: PropTypes.object.isRequired,
  lock: PropTypes.object.isRequired,
  onChange: PropTypes.func,
  placeholder: PropTypes.string.isRequired,
  policy: PropTypes.object,
  strengthMessages: PropTypes.object,
  hidden: PropTypes.bool
};
