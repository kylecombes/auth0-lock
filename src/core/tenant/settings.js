import { load } from '../../utils/cdn_utils';

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
import { initTenant } from './index';

export function fetchTenantSettings(tenantBaseUrl, cb) {
  load({
    method: 'setTenant',
    url: `${tenantBaseUrl}?t${+new Date()}`,
    check: () => true,
    cb: cb
  });
}

export function syncTenantSettingsSuccess(m, client_id, result) {
  m = initTenant(m, client_id, result);
  m = filterConnections(m);
  m = runHook(m, 'didReceiveClientSettings');
  return m;
}
