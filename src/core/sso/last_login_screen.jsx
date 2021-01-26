import React from 'react';
import Screen from '../screen';
import QuickAuthPane from '../../ui/pane/quick_auth_pane';
import { logIn, checkSession, skipQuickAuth } from '../../quick-auth/actions';
import { lastUsedConnection, lastUsedUsername } from './index';

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
} from '../index';
import { renderSignedInConfirmation } from '../signed_in_confirmation';
import { STRATEGIES as SOCIAL_STRATEGIES, authButtonsTheme } from '../../connection/social/index';

// TODO: handle this from CSS
function icon(strategy) {
  if (SOCIAL_STRATEGIES[strategy]) return strategy;
  if (strategy === 'google-apps') return strategy;
  if (~['adfs', 'office365', 'waad'].indexOf(strategy)) return 'windows';
  return 'auth0';
}

const Component = ({ i18n, model }) => {
  const headerText = i18n.html('lastLoginInstructions') || null;
  const header = headerText && <p>{headerText}</p>;
  const theme = authButtonsTheme(model);
  const connectionName = lastUsedConnection(model).get('name');
  const buttonTheme = theme.get(connectionName);
  const primaryColor = buttonTheme && buttonTheme.get('primaryColor');
  const foregroundColor = buttonTheme && buttonTheme.get('foregroundColor');
  const buttonIcon = buttonTheme && buttonTheme.get('icon');

  const buttonClickHandler = () => {
    const isUniversalLogin = window.location.host === domain(model);
    if (isUniversalLogin) {
      logIn(id(model), lastUsedConnection(model), lastUsedUsername(model));
    } else {
      checkSession(id(model), lastUsedConnection(model), lastUsedUsername(model));
    }
  };
  const buttonLabel =
    lastUsedUsername(model) || SOCIAL_STRATEGIES[connectionName] || connectionName;

  return (
    <QuickAuthPane
      alternativeLabel={i18n.str('notYourAccountAction')}
      alternativeClickHandler={() => skipQuickAuth(id(model))}
      buttonLabel={buttonLabel}
      buttonClickHandler={buttonClickHandler}
      header={header}
      strategy={icon(lastUsedConnection(model).get('strategy') || connectionName)}
      buttonIcon={buttonIcon}
      primaryColor={primaryColor}
      foregroundColor={foregroundColor}
    />
  );
};

export default class LastLoginScreen extends Screen {
  constructor() {
    super('lastLogin');
  }

  renderAuxiliaryPane(lock) {
    return renderSignedInConfirmation(lock);
  }

  render() {
    return Component;
  }
}
