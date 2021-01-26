import React from 'react';
import Screen from '../../core/screen';
import QuickAuthPane from '../../ui/pane/quick_auth_pane';
import { logIn, skipQuickAuth } from '../../quick-auth/actions';
import { renderSignedInConfirmation } from '../../core/signed_in_confirmation';

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
import { corpNetworkConnection } from '../enterprise';

const Component = ({ i18n, model }) => {
  const headerText = i18n.html('windowsAuthInstructions') || null;
  const header = headerText && <p>{headerText}</p>;

  return (
    <QuickAuthPane
      alternativeLabel={i18n.str('notYourAccountAction')}
      alternativeClickHandler={() => skipQuickAuth(id(model))}
      buttonLabel={i18n.str('windowsAuthLabel')}
      buttonClickHandler={e => logIn(id(model), corpNetworkConnection(model))}
      header={header}
      strategy="windows"
    />
  );
};

export default class KerberosScreen extends Screen {
  constructor() {
    super('kerberos');
  }

  renderAuxiliaryPane(lock) {
    return renderSignedInConfirmation(lock);
  }

  render() {
    return Component;
  }
}
