import React from 'react';
import Screen from '../../core/screen';
import QuickAuthPane from '../../ui/pane/quick_auth_pane';
import { logIn } from '../../quick-auth/actions';
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
import { quickAuthConnection } from '../enterprise';
import { authButtonsTheme } from '../../connection/social/index';

// TODO: handle this from CSS
function icon(strategy) {
  if (strategy === 'google-apps') return strategy;
  if (~['adfs', 'office365', 'waad'].indexOf(strategy)) return 'windows';
  return 'auth0';
}

const Component = ({ i18n, model }) => {
  const headerText = i18n.html('enterpriseLoginIntructions') || null;
  const header = headerText && <p>{headerText}</p>;
  const theme = authButtonsTheme(model);
  const connection = quickAuthConnection(model);
  const connectionName = connection.getIn(['name']);
  const connectionDomain = connection.getIn(['domains', 0]);
  const connectionDisplayName = connection.getIn(['displayName']) || null;
  const preferConnectionDisplayName = ui.preferConnectionDisplayName(model);
  const buttonTheme = theme.get(connection.get('name'));

  const buttonLabel =
    (buttonTheme && buttonTheme.get('displayName')) ||
    (preferConnectionDisplayName &&
      connectionDisplayName &&
      i18n.str('loginAtLabel', connectionDisplayName)) ||
    (connectionDomain && i18n.str('loginAtLabel', connectionDomain)) ||
    i18n.str('loginAtLabel', connectionName);

  const primaryColor = buttonTheme && buttonTheme.get('primaryColor');
  const foregroundColor = buttonTheme && buttonTheme.get('foregroundColor');
  const buttonIcon = buttonTheme && buttonTheme.get('icon');

  return (
    <QuickAuthPane
      buttonLabel={buttonLabel}
      buttonClickHandler={e => logIn(id(model), quickAuthConnection(model))}
      header={header}
      buttonIcon={buttonIcon}
      primaryColor={primaryColor}
      foregroundColor={foregroundColor}
      strategy={icon(quickAuthConnection(model).get('strategy'))}
    />
  );
};

export default class QuickAuthScreen extends Screen {
  constructor() {
    super('enterpriseQuickAuth');
  }

  renderAuxiliaryPane(lock) {
    return renderSignedInConfirmation(lock);
  }

  render() {
    return Component;
  }
}
