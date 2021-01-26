import PropTypes from 'prop-types';
import React from 'react';
import SuccessPane from '../../ui/box/success_pane';
import { closeLock } from '../../core/actions';

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
import * as i18n from '../../i18n'; // TODO: can't we get this from props?

export default class PasswordResetConfirmation extends React.Component {
  handleClose() {
    const { closeHandler, lock } = this.props;
    closeHandler(id(lock));
  }

  render() {
    const { lock } = this.props;
    const closeHandler = ui.closable(lock) ? ::this.handleClose : undefined;

    return (
      <SuccessPane lock={lock} closeHandler={closeHandler}>
        <p>{i18n.html(this.props.lock, ['success', 'forgotPassword'])}</p>
      </SuccessPane>
    );
  }
}

PasswordResetConfirmation.propTypes = {
  closeHandler: PropTypes.func.isRequired,
  lock: PropTypes.object.isRequired
};

export function renderPasswordResetConfirmation(m, props = {}) {
  props.closeHandler = closeLock;
  props.key = 'auxiliarypane';
  props.lock = m;

  return m.get('passwordResetted') ? <PasswordResetConfirmation {...props} /> : null;
}
