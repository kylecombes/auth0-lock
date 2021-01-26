import Immutable, { List, Map } from 'immutable';

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
import { clearFields } from '../../field/index';
import { initLocation } from '../../field/phone_number';
import { dataFns } from '../../utils/data_utils';
const { get, initNS, tget, tremove, tset } = dataFns(['passwordless']);
import webAPI from '../../core/web_api';
import sync from '../../sync';

export function initPasswordless(m, opts) {
  // TODO: validate opts
  const send = opts.passwordlessMethod === 'link' ? 'link' : 'code';
  const mustAcceptTerms = !!opts.mustAcceptTerms;
  const showTerms = opts.showTerms === undefined ? true : !!opts.showTerms;

  m = initNS(m, Map({ send, mustAcceptTerms, showTerms }));
  if (opts.defaultLocation && typeof opts.defaultLocation === 'string') {
    m = initLocation(m, opts.defaultLocation.toUpperCase());
  } else {
    m = sync(m, 'location', {
      recoverResult: 'US',
      syncFn: (m, cb) => webAPI.getUserCountry(id(m), cb),
      successFn: (m, result) => initLocation(m, result)
    });
  }
  return m;
}

function setResendStatus(m, value) {
  // TODO: check value
  return tset(m, 'resendStatus', value);
}

export function setResendSuccess(m) {
  return setResendStatus(m, 'success');
}

export function resendSuccess(m) {
  return resendStatus(m) == 'success';
}

export function setResendFailed(m) {
  return setResendStatus(m, 'failed');
}

export function resendFailed(m) {
  return resendStatus(m) == 'failed';
}

export function resendOngoing(m) {
  return resendStatus(m) == 'ongoing';
}

export function resend(m) {
  if (resendAvailable(m)) {
    return setResendStatus(m, 'ongoing');
  } else {
    return m;
  }
}

function resendStatus(m) {
  return tget(m, 'resendStatus', 'waiting');
}

export function resendAvailable(m) {
  return resendStatus(m) == 'waiting' || resendStatus(m) == 'failed';
}

export function restartPasswordless(m) {
  // TODO: maybe we can take advantage of the transient fields
  m = tremove(m, 'passwordlessStarted');
  m = tremove(m, 'resendStatus'); // only for link
  m = clearFields(m, ['vcode']); // only for code

  return clearGlobalError(m);
}

export function send(m) {
  return get(m, 'send', isEmail(m) ? 'link' : 'code');
}

export function isSendLink(m) {
  return send(m) === 'link';
}

export function setPasswordlessStarted(m, value) {
  return tset(m, 'passwordlessStarted', value);
}

export function passwordlessStarted(m) {
  return tget(m, 'passwordlessStarted', false);
}

export function passwordlessConnection(m) {
  return (
    connections(m, 'passwordless', 'email').get(0) ||
    connections(m, 'passwordless', 'sms').get(0) ||
    new Map()
  );
}

export function isEmail(m) {
  const c = passwordlessConnection(m);
  return c.isEmpty() ? undefined : c.get('strategy') === 'email';
}

export function showTerms(m) {
  return get(m, 'showTerms', true);
}

export function mustAcceptTerms(m) {
  return get(m, 'mustAcceptTerms', false);
}

export function termsAccepted(m) {
  return !mustAcceptTerms(m) || tget(m, 'termsAccepted', false);
}

export function toggleTermsAcceptance(m) {
  return tset(m, 'termsAccepted', !termsAccepted(m));
}
