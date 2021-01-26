import PropTypes from 'prop-types';
import React from 'react';
import VcodeInput from '../../ui/input/vcode_input';

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
import * as c from '../index';
import { isSmallScreen } from '../../utils/media_utils';
import { swap, updateEntity } from '../../store/index';
import { setVcode } from '../vcode';

export default class VcodePane extends React.Component {
  handleVcodeChange = e => {
    e.preventDefault();
    swap(updateEntity, 'lock', id(this.props.lock), setVcode, e.target.value);
  };

  handleResendClick = e => {
    e.preventDefault();
    const { lock, onRestart } = this.props;
    onRestart(id(lock));
  };

  render() {
    const { instructions, lock, placeholder, resendLabel } = this.props;
    const headerText = instructions || null;
    const header = headerText && <p>{headerText}</p>;

    return (
      <div>
        {header}
        <VcodeInput
          lockId={id(lock)}
          value={c.vcode(lock)}
          isValid={!c.isFieldVisiblyInvalid(lock, 'vcode') && !globalError(lock)}
          onChange={this.handleVcodeChange}
          autoFocus={!isSmallScreen()}
          placeholder={placeholder}
          disabled={submitting(lock)}
        />
        <p className="auth0-lock-alternative">
          <a className="auth0-lock-alternative-link" href="#" onClick={this.handleResendClick}>
            {resendLabel}
          </a>
        </p>
      </div>
    );
  }
}

VcodePane.propTypes = {
  instructions: PropTypes.string,
  lock: PropTypes.object.isRequired,
  placeholder: PropTypes.string.isRequired,
  resendLabel: PropTypes.string.isRequired,
  onRestart: PropTypes.func.isRequired
};
