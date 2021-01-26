import Base from '../index';
import Login from './classic/login';
import SignUp from './classic/sign_up_screen';
import MFALoginScreen from './classic/mfa_login_screen';
import ResetPassword from '../connection/database/reset_password';
import { renderSSOScreens } from '../core/sso/index';
import {
  additionalSignUpFields,
  authWithUsername,
  databaseUsernameValue,
  defaultDatabaseConnection,
  defaultDatabaseConnectionName,
  getScreen,
  hasInitialScreen,
  hasScreen,
  initDatabase,
  overrideDatabaseOptions,
  resolveAdditionalSignUpFields
} from '../connection/database/index';
import {
  isADEnabled,
  defaultEnterpriseConnection,
  defaultEnterpriseConnectionName,
  initEnterprise,
  isEnterpriseDomain,
  isHRDActive,
  isInCorpNetwork,
  quickAuthConnection
} from '../connection/enterprise';
import { defaultDirectory, defaultDirectoryName } from '../core/tenant';
import { setEmail } from '../field/email';
import { setUsername } from '../field/username';
import {
  ui,
  hasConnection,
  findConnection,
  hasStopped,
  id,
  prefill,
  warn,
  error,
  stop,
  hasSomeConnections,
  hasOnlyConnections
} from '../core/index';
import KerberosScreen from '../connection/enterprise/kerberos_screen';
import HRDScreen from '../connection/enterprise/hrd_screen';
import EnterpriseQuickAuthScreen from '../connection/enterprise/quick_auth_screen';
import { hasSkippedQuickAuth } from '../quick_auth';
import * as sso from '../core/sso/index';
import LoadingScreen from '../core/loading_screen';
import ErrorScreen from '../core/error_screen';
import LastLoginScreen from '../core/sso/last_login_screen';
import { hasError, isDone, isSuccess } from '../sync';
import { getFieldValue } from '../field/index';
import { swap, updateEntity } from '../store/index';

export function isSSOEnabled(m, options) {
  return matchesEnterpriseConnection(m, databaseUsernameValue(m, options));
}

export function matchesEnterpriseConnection(m, usernameValue) {
  return isEnterpriseDomain(m, usernameValue);
}

export function usernameStyle(m) {
  return authWithUsername(m) && !isADEnabled(m) ? 'username' : 'email';
}

export function hasOnlyClassicConnections(m, type = undefined, ...strategies) {
  return hasOnlyConnections(m, type, ...strategies) && !hasSomeConnections(m, 'passwordless');
}

function validateAllowedConnections(m) {
  const anyDBConnection = hasSomeConnections(m, 'database');
  const anySocialConnection = hasSomeConnections(m, 'social');
  const anyEnterpriseConnection = hasSomeConnections(m, 'enterprise');

  if (!anyDBConnection && !anySocialConnection && !anyEnterpriseConnection) {
    const error = new Error(
      'At least one database, enterprise or social connection needs to be available.'
    );
    error.code = 'no_connection';
    m = stop(m, error);
  } else if (!anyDBConnection && hasInitialScreen(m, 'forgotPassword')) {
    const error = new Error(
      'The `initialScreen` option was set to "forgotPassword" but no database connection is available.'
    );
    error.code = 'unavailable_initial_screen';
    m = stop(m, error);
  } else if (!anyDBConnection && !anySocialConnection && hasInitialScreen(m, 'signUp')) {
    const error = new Error(
      'The `initialScreen` option was set to "signUp" but no database or social connection is available.'
    );
    error.code = 'unavailable_initial_screen';
    m = stop(m, error);
  }

  if (defaultDirectoryName(m) && !defaultDirectory(m)) {
    error(m, `The account's default directory "${defaultDirectoryName(m)}" is not enabled.`);
  }

  if (defaultDatabaseConnectionName(m) && !defaultDatabaseConnection(m)) {
    warn(
      m,
      `The provided default database connection "${defaultDatabaseConnectionName(
        m
      )}" is not enabled.`
    );
  }

  if (defaultEnterpriseConnectionName(m) && !defaultEnterpriseConnection(m)) {
    warn(
      m,
      `The provided default enterprise connection "${defaultEnterpriseConnectionName(
        m
      )}" is not enabled or does not allow email/password authentication.`
    );
  }

  return m;
}

const setPrefill = m => {
  const { email, username } = prefill(m).toJS();
  if (typeof email === 'string') m = setEmail(m, email);
  if (typeof username === 'string') m = setUsername(m, username, 'username', false);
  return m;
};

function createErrorScreen(m, stopError) {
  setTimeout(() => {
    swap(updateEntity, 'lock', id(m), stop, stopError);
  }, 0);

  return new ErrorScreen();
}

class Classic {
  static SCREENS = {
    login: Login,
    forgotPassword: ResetPassword,
    signUp: SignUp,
    mfaLogin: MFALoginScreen
  };

  didInitialize(model, options) {
    model = initDatabase(model, options);
    model = initEnterprise(model, options);

    return model;
  }

  didReceiveClientSettings(m) {
    m = validateAllowedConnections(m);
    m = setPrefill(m);
    return m;
  }

  willShow(m, opts) {
    m = overrideDatabaseOptions(m, opts);
    m = resolveAdditionalSignUpFields(m);
    if (isSuccess(m, 'client')) {
      m = validateAllowedConnections(m);
    }
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

    if (hasScreen(m, 'login')) {
      if (!hasSkippedQuickAuth(m) && hasInitialScreen(m, 'login')) {
        if (isInCorpNetwork(m)) {
          return new KerberosScreen();
        }

        if (ui.rememberLastLogin(m)) {
          const lastUsedConnection = sso.lastUsedConnection(m);
          const lastUsedUsername = sso.lastUsedUsername(m);
          if (
            lastUsedConnection &&
            isSuccess(m, 'sso') &&
            hasConnection(m, lastUsedConnection.get('name')) &&
            findConnection(m, lastUsedConnection.get('name')).get('type') !== 'passwordless'
          ) {
            return new LastLoginScreen();
          }
        }
      }

      if (quickAuthConnection(m)) {
        return new EnterpriseQuickAuthScreen();
      }

      if (isHRDActive(m)) {
        return new HRDScreen();
      }
    }

    if (!hasScreen(m, 'login') && !hasScreen(m, 'signUp') && !hasScreen(m, 'forgotPassword')) {
      const errorMessage =
        'No available Screen. You have to allow at least one of those screens: `login`, `signUp`or `forgotPassword`.';
      const noAvailableScreenError = new Error(errorMessage);
      noAvailableScreenError.code = 'internal_error';
      noAvailableScreenError.description = errorMessage;
      return createErrorScreen(m, noAvailableScreenError);
    }

    const Screen = Classic.SCREENS[getScreen(m)];
    if (Screen) {
      return new Screen();
    }
    const noScreenError = new Error('Internal error');
    noScreenError.code = 'internal_error';
    noScreenError.description = `Couldn't find a screen "${getScreen(m)}"`;
    return createErrorScreen(m, noScreenError);
  }
}

export default new Classic();
