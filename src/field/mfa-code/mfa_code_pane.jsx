import PropTypes from 'prop-types';
import React from 'react';
import MFACodeInput from '../../ui/input/mfa_code_input';
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
import { setMFACode, getMFACodeValidation } from '../mfa_code';

export default class MFACodePane extends React.Component {
  handleChange(e) {
    const { lock } = this.props;
    swap(updateEntity, 'lock', id(lock), setMFACode, e.target.value);
  }

  render() {
    const { i18n, lock, placeholder } = this.props;

    return (
      <MFACodeInput
        lockId={id(lock)}
        value={c.getFieldValue(lock, 'mfa_code')}
        invalidHint={i18n.str('mfaCodeErrorHint', getMFACodeValidation().length)}
        isValid={!c.isFieldVisiblyInvalid(lock, 'mfa_code')}
        onChange={::this.handleChange}
        placeholder={placeholder}
      />
    );
  }
}

MFACodePane.propTypes = {
  i18n: PropTypes.object.isRequired,
  lock: PropTypes.object.isRequired,
  placeholder: PropTypes.string.isRequired
};
