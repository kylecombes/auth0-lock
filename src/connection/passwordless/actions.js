import { Map } from 'immutable';
import { read, getEntity, swap, updateEntity } from '../../store/index';
import { closeLock, logIn as coreLogIn, validateAndSubmit, logInSuccess } from '../../core/actions';
import webApi from '../../core/web_api';
import * as c from '../../field/index';

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
import {
  isEmail,
  isSendLink,
  resend,
  restartPasswordless,
  send,
  setPasswordlessStarted,
  setResendFailed,
  setResendSuccess,
  toggleTermsAcceptance as internalToggleTermsAcceptance
} from './index';
import { phoneNumberWithDiallingCode } from '../../field/phone_number';
import * as i18n from '../../i18n';

function getErrorMessage(m, error) {
  let key = error.error;

  if (
    error.error === 'sms_provider_error' &&
    (error.description || '').indexOf('(Code: 21211)') > -1
  ) {
    key = 'bad.phone_number';
  }

  return (
    i18n.html(m, ['error', 'passwordless', key]) ||
    i18n.html(m, ['error', 'passwordless', 'lock.fallback'])
  );
}

export function requestPasswordlessEmail(id) {
  validateAndSubmit(id, ['email'], m => {
    sendEmail(m, requestPasswordlessEmailSuccess, requestPasswordlessEmailError);
  });
}

export function requestPasswordlessEmailSuccess(id) {
  swap(updateEntity, 'lock', id, m => {
    m = setSubmitting(m, false);
    return setPasswordlessStarted(m, true);
  });
}

export function requestPasswordlessEmailError(id, error) {
  const m = read(getEntity, 'lock', id);
  const errorMessage = getErrorMessage(m, error);
  return swap(updateEntity, 'lock', id, setSubmitting, false, errorMessage);
}

export function resendEmail(id) {
  swap(updateEntity, 'lock', id, resend);
  const m = read(getEntity, 'lock', id);
  sendEmail(m, resendEmailSuccess, resendEmailError);
}

function resendEmailSuccess(id) {
  swap(updateEntity, 'lock', id, setResendSuccess);
}

function resendEmailError(id, error) {
  swap(updateEntity, 'lock', id, setResendFailed);
}

function sendEmail(m, successFn, errorFn) {
  const params = {
    connection: 'email',
    email: c.getFieldValue(m, 'email'),
    send: send(m)
  };

  if (isSendLink(m) && !auth.params(m).isEmpty()) {
    params.authParams = auth.params(m).toJS();
  }

  webApi.startPasswordless(id(m), params, error => {
    if (error) {
      setTimeout(() => errorFn(id(m), error), 250);
    } else {
      successFn(id(m));
    }
  });
}

export function sendSMS(id) {
  validateAndSubmit(id, ['phoneNumber'], m => {
    const params = {
      connection: 'sms',
      phoneNumber: phoneNumberWithDiallingCode(m),
      send: send(m)
    };
    webApi.startPasswordless(id, params, error => {
      if (error) {
        setTimeout(() => sendSMSError(id, error), 250);
      } else {
        sendSMSSuccess(id);
      }
    });
  });
}

function sendSMSSuccess(id) {
  swap(updateEntity, 'lock', id, m => {
    m = setSubmitting(m, false);
    m = setPasswordlessStarted(m, true);
    return m;
  });
}

function sendSMSError(id, error) {
  const m = read(getEntity, 'lock', id);
  const errorMessage = getErrorMessage(m, error);
  emitAuthorizationErrorEvent(m, error);
  return swap(updateEntity, 'lock', id, setSubmitting, false, errorMessage);
}

export function logIn(id) {
  const m = read(getEntity, 'lock', id);
  const authParams = auth.params(m).toJS();
  const params = {
    verificationCode: c.getFieldValue(m, 'vcode'),
    ...authParams
  };
  if (isEmail(m)) {
    params.connection = 'email';
    params.email = c.getFieldValue(m, 'email');
  } else {
    params.connection = 'sms';
    params.phoneNumber = phoneNumberWithDiallingCode(m);
  }
  swap(updateEntity, 'lock', id, setSubmitting, true);
  webApi.passwordlessVerify(id, params, (error, result) => {
    let errorMessage;
    if (error) {
      const m = read(getEntity, 'lock', id);
      errorMessage = getErrorMessage(m, error);
      if (error.logToConsole) {
        console.error(error.description);
      }
      emitAuthorizationErrorEvent(m, error);
      return swap(updateEntity, 'lock', id, setSubmitting, false, errorMessage);
    } else {
      return logInSuccess(id, result);
    }
  });
}

export function restart(id) {
  swap(updateEntity, 'lock', id, restartPasswordless);
}

export function toggleTermsAcceptance(id) {
  swap(updateEntity, 'lock', id, internalToggleTermsAcceptance);
}
