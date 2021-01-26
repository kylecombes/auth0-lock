import { swap, updateEntity } from '../store/index';
import ErrorScreen from '../core/error_screen';
import LoadingScreen from '../core/loading_screen';
import SocialOrEmailLoginScreen from './passwordless/social_or_email_login_screen';
import SocialOrPhoneNumberLoginScreen from './passwordless/social_or_phone_number_login_screen';
import VcodeScreen from '../connection/passwordless/ask_vcode';
import LastLoginScreen from '../core/sso/last_login_screen';
import {
  initPasswordless,
  isEmail,
  isSendLink,
  passwordlessStarted
} from '../connection/passwordless/index';
import { isDone, isSuccess } from '../sync';

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
import { hasSkippedQuickAuth } from '../quick_auth';
import * as sso from '../core/sso/index';
import { setEmail } from '../field/email';
import { setPhoneNumber } from '../field/phone_number';

const setPrefill = m => {
  const { email, phoneNumber } = prefill(m).toJS();
  if (typeof email === 'string') {
    m = setEmail(m, email);
  }
  if (typeof phoneNumber === 'string') {
    m = setPhoneNumber(m, phoneNumber);
  }
  return m;
};

class Passwordless {
  didInitialize(m, opts) {
    m = initPasswordless(m, opts);

    return m;
  }

  didReceiveClientSettings(m) {
    const anySocialConnection = hasSomeConnections(m, 'social');
    const anyPasswordlessConnection = hasSomeConnections(m, 'passwordless');

    if (!anySocialConnection && !anyPasswordlessConnection) {
      const error = new Error(
        'At least one email, sms or social connection needs to be available.'
      );
      error.code = 'no_connection';
      m = stop(m, error);
    }
    m = setPrefill(m);

    return m;
  }

  render(m) {
    //if there's an error, we should show the error screen no matter what.
    if (hasStopped(m)) {
      return new ErrorScreen();
    }

    // TODO: remove the detail about the loading pane being pinned,
    // sticky screens should be handled at the box module.
    if (!isDone(m) || m.get('isLoadingPanePinned')) {
      return new LoadingScreen();
    }

    if (!hasSkippedQuickAuth(m)) {
      if (ui.rememberLastLogin(m)) {
        const lastUsedConnection = sso.lastUsedConnection(m);
        const lastUsedUsername = sso.lastUsedUsername(m);
        if (
          lastUsedConnection &&
          isSuccess(m, 'sso') &&
          hasConnection(m, lastUsedConnection.get('name')) &&
          ['passwordless', 'social'].indexOf(
            findConnection(m, lastUsedConnection.get('name')).get('type')
          ) >= 0 //if connection.type is either passwordless or social
        ) {
          const conn = findConnection(m, lastUsedConnection.get('name'));
          const connectionType = conn.get('type');
          if (connectionType === 'passwordless' || connectionType === 'social') {
            return new LastLoginScreen();
          }
        }
      }
    }

    if (isEmail(m)) {
      return isSendLink(m) || !passwordlessStarted(m)
        ? new SocialOrEmailLoginScreen()
        : new VcodeScreen();
    } else {
      return passwordlessStarted(m) ? new VcodeScreen() : new SocialOrPhoneNumberLoginScreen();
    }
  }
}

export default new Passwordless();
