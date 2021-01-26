import { skipQuickAuth as skip } from '../quick_auth';
import { getEntity, read, swap, updateEntity } from '../store/index';
import { logIn as coreLogIn, checkSession as coreCheckSession } from '../core/actions';

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
} from '../core/index';

export function skipQuickAuth(id) {
  swap(updateEntity, 'lock', id, skip, true);
}

export function logIn(id, connection, loginHint, prompt) {
  const m = read(getEntity, 'lock', id);
  const connectionScopes = auth.connectionScopes(m);
  const scopes = connectionScopes.get(connection.get('name'));
  const params = {
    connection: connection.get('name'),
    connection_scope: scopes ? scopes.toJS() : undefined
  };
  if (!auth.redirect(m) && connection.get('strategy') === 'facebook') {
    params.display = 'popup';
  }
  if (loginHint) {
    params.login_hint = loginHint;
  }
  if (prompt) {
    params.prompt = prompt;
  }

  if (connection.get('strategy') === 'apple') {
    swap(updateEntity, 'lock', id(m), setSupressSubmitOverlay, true);
  } else {
    swap(updateEntity, 'lock', id(m), setSupressSubmitOverlay, false);
  }

  params.isSubmitting = false;
  coreLogIn(id, [], params);
}

export function checkSession(id, connection, loginHint) {
  const m = read(getEntity, 'lock', id);
  if (auth.responseType(m).indexOf('code') >= 0) {
    // we need to force a redirect in this case
    // so we use login with prompt=none
    return logIn(id, connection, loginHint, 'none');
  } else {
    const connectionScopes = auth.connectionScopes(m);
    const scopes = connectionScopes.get(connection.get('name'));
    const params = {
      ...auth.params(m).toJS(),
      connection: connection.get('name')
    };

    coreCheckSession(id, params);
  }
}
