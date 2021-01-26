import { getEntity, read, swap, updateEntity } from '../../store/index';
import {
  enterpriseActiveFlowConnection,
  isHRDActive,
  matchConnection,
  toggleHRD
} from '../enterprise';
import { getFieldValue, hideInvalidFields } from '../../field/index';
import { emailLocalPart } from '../../field/email';
import { logIn as coreLogIn } from '../../core/actions';

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

// TODO: enterprise connections should not depend on database
// connections. However, we now allow a username input to contain also
// an email and this information is in the database module. We should
// make this information flow from the UI (like we do for the startHRD
// function). Including this dependency here allows us to do that
// incrementally.
import { databaseLogInWithEmail } from '../database/index';

export function startHRD(id, email) {
  swap(updateEntity, 'lock', id, toggleHRD, email);
}

export function cancelHRD(id) {
  swap(updateEntity, 'lock', id, m => {
    m = toggleHRD(m, false);
    m = hideInvalidFields(m);
    return m;
  });
}

function getConnectionScopesFrom(m, connection) {
  const connectionScopes = auth.connectionScopes(m);
  return connectionScopes.get(connection.get('name'));
}

export function logIn(id) {
  const m = read(getEntity, 'lock', id);
  const email = getFieldValue(m, databaseLogInWithEmail(m) ? 'email' : 'username');
  const ssoConnection = matchConnection(m, email);
  const enterpriseConnection = enterpriseActiveFlowConnection(m);
  const connectionScopes = getConnectionScopesFrom(m, ssoConnection || enterpriseConnection);

  const params = {
    connection_scope: connectionScopes ? connectionScopes.toJS() : undefined
  };

  if (ssoConnection && !isHRDActive(m)) {
    return logInSSO(id, ssoConnection, params);
  }

  logInActiveFlow(id, params);
}

function logInActiveFlow(id, params) {
  const m = read(getEntity, 'lock', id);
  const usernameField = isHRDActive(m) || !databaseLogInWithEmail(m) ? 'username' : 'email';

  const originalUsername = getFieldValue(m, usernameField);
  const connection = enterpriseActiveFlowConnection(m);

  const username = defaultADUsernameFromEmailPrefix(m)
    ? emailLocalPart(originalUsername)
    : originalUsername;

  coreLogIn(id, ['password', usernameField], {
    ...params,
    connection: connection ? connection.get('name') : null,
    username: username,
    password: getFieldValue(m, 'password'),
    login_hint: username
  });
}

function logInSSO(id, connection, params) {
  const m = read(getEntity, 'lock', id);
  const field = databaseLogInWithEmail(m) ? 'email' : 'username';

  emitEvent(m, 'sso login', {
    lockID: id,
    connection: connection,
    field: field
  });

  coreLogIn(id, [field], {
    ...params,
    connection: connection.get('name'),
    login_hint: getFieldValue(m, field)
  });
}
