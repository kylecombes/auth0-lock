import PropTypes from 'prop-types';
import React from 'react';
import { BackButton, CloseButton } from './button';

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

const ConfirmationPane = ({ lock, backHandler, children, closeHandler, svg }) => (
  <div className="auth0-lock-confirmation">
    {closeHandler && <CloseButton lockId={id(lock)} onClick={closeHandler} />}
    {backHandler && <BackButton lockId={id(lock)} onClick={backHandler} />}
    <div className="auth0-lock-confirmation-content">
      <span dangerouslySetInnerHTML={{ __html: svg }} />
      {children}
    </div>
  </div>
);

ConfirmationPane.propTypes = {
  backHandler: PropTypes.func,
  closeHandler: PropTypes.func,
  children: PropTypes.oneOfType([
    PropTypes.element.isRequired,
    PropTypes.arrayOf(PropTypes.element).isRequired
  ]),
  svg: PropTypes.string.isRequired
};

export default ConfirmationPane;
