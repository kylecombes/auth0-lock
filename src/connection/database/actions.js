import Immutable, { Map } from 'immutable';
import { getEntity, read, swap, updateEntity } from '../../store/index';
import webApi from '../../core/web_api';
import { closeLock, logIn as coreLogIn, logInSuccess, validateAndSubmit } from '../../core/actions';
import {
  auth,
  captcha,
  emitEvent,
  loginErrorMessage,
  setCaptcha,
  setGlobalSuccess,
  setSubmitting,
  ui
} from '../../core/index';
import * as c from '../../field/index';
import {
  databaseConnection,
  databaseConnectionName,
  databaseConnectionRequiresUsername,
  databaseLogInWithEmail,
  hasScreen,
  setScreen,
  shouldAutoLogin,
  toggleTermsAcceptance as internalToggleTermsAcceptance,
  additionalSignUpFields,
  signUpHideUsernameField
} from './index';
import * as i18n from '../../i18n';

export function logIn(id, needsMFA = false) {
  const m = read(getEntity, 'lock', id);
  const usernameField = databaseLogInWithEmail(m) ? 'email' : 'username';
  const username = c.getFieldValue(m, usernameField);
  const params = {
    connection: databaseConnectionName(m),
    username: username,
    password: c.getFieldValue(m, 'password')
  };

  const fields = [usernameField, 'password'];

  const isCaptchaValid = setCaptchaParams(m, params, fields);
  if (!isCaptchaValid) {
    return showMissingCaptcha(m, id);
  }

  const mfaCode = c.getFieldValue(m, 'mfa_code');
  if (needsMFA) {
    params['mfa_code'] = mfaCode;
    fields.push('mfa_code');
  }

  coreLogIn(id, fields, params, (id, error, fields, next) => {
    if (error.error === 'a0.mfa_required') {
      return showLoginMFAActivity(id);
    }

    if (error) {
      const wasInvalid = error && error.code === 'invalid_captcha';
      return swapCaptcha(id, wasInvalid, next);
    }

    next();
  });
}

function generateRandomUsername(length) {
  let result = '';
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export function signUp(id) {
  const m = read(getEntity, 'lock', id);
  const fields = ['email', 'password'];

  // Skip the username validation if signUpHideUsernameField option is enabled.
  // We will generate a random username to avoid name collusion before we make the signup API cal
  if (databaseConnectionRequiresUsername(m) && !signUpHideUsernameField(m)) fields.push('username');

  additionalSignUpFields(m).forEach(x => fields.push(x.get('name')));

  validateAndSubmit(id, fields, m => {
    const params = {
      connection: databaseConnectionName(m),
      email: c.getFieldValue(m, 'email'),
      password: c.getFieldValue(m, 'password'),
      autoLogin: shouldAutoLogin(m)
    };

    const isCaptchaValid = setCaptchaParams(m, params, fields);
    if (!isCaptchaValid) {
      return showMissingCaptcha(m, id);
    }

    if (databaseConnectionRequiresUsername(m)) {
      if (signUpHideUsernameField(m)) {
        const usernameValidation = databaseConnection(m).getIn(['validation', 'username']);
        const range = usernameValidation ? usernameValidation.toJS() : { max: 15 };
        params.username = generateRandomUsername(range.max);
      } else {
        params.username = c.getFieldValue(m, 'username');
      }
    }

    if (!additionalSignUpFields(m).isEmpty()) {
      params.user_metadata = {};
      additionalSignUpFields(m).forEach(x => {
        const storage = x.get('storage');
        const fieldName = x.get('name');
        const fieldValue = c.getFieldValue(m, x.get('name'));
        switch (storage) {
          case 'root':
            params[fieldName] = fieldValue;
            break;
          default:
            if (!params.user_metadata) {
              params.user_metadata = {};
            }
            params.user_metadata[fieldName] = fieldValue;
            break;
        }
      });
    }

    webApi.signUp(id, params, (error, result, popupHandler, ...args) => {
      if (error) {
        if (!!popupHandler) {
          popupHandler._current_popup.kill();
        }
        const wasInvalidCaptcha = error && error.code === 'invalid_captcha';
        swapCaptcha(id, wasInvalidCaptcha, () => {
          setTimeout(() => signUpError(id, error), 250);
        });
      } else {
        signUpSuccess(id, result, popupHandler, ...args);
      }
    });
  });
}

function signUpSuccess(id, result, popupHandler) {
  const lock = read(getEntity, 'lock', id);

  emitEvent(lock, 'signup success', result);

  if (shouldAutoLogin(lock)) {
    swap(updateEntity, 'lock', id, m => m.set('signedUp', true));

    // TODO: check options, redirect is missing
    const options = {
      connection: databaseConnectionName(lock),
      username: c.email(lock),
      password: c.password(lock)
    };

    if (!!popupHandler) {
      options.popupHandler = popupHandler;
    }

    return webApi.logIn(id, options, auth.params(lock).toJS(), (error, ...args) => {
      if (error) {
        setTimeout(() => autoLogInError(id, error), 250);
      } else {
        logInSuccess(id, ...args);
      }
    });
  }

  const autoclose = ui.autoclose(lock);

  if (!autoclose) {
    swap(updateEntity, 'lock', id, lock => setSubmitting(lock, false).set('signedUp', true));
  } else {
    closeLock(id, false);
  }
}

export function signUpError(id, error) {
  const m = read(getEntity, 'lock', id);

  const invalidPasswordKeys = {
    PasswordDictionaryError: 'password_dictionary_error',
    PasswordNoUserInfoError: 'password_no_user_info_error',
    PasswordStrengthError: 'password_strength_error'
  };

  const errorKey =
    (error.code === 'invalid_password' && invalidPasswordKeys[error.name]) || error.code;

  let errorMessage =
    i18n.html(m, ['error', 'signUp', errorKey]) ||
    i18n.html(m, ['error', 'signUp', 'lock.fallback']);

  emitEvent(m, 'signup error', error);

  if (errorKey === 'invalid_captcha') {
    errorMessage = i18n.html(m, ['error', 'login', errorKey]);
    return swapCaptcha(id, true, () => {
      swap(updateEntity, 'lock', id, setSubmitting, false, errorMessage);
    });
  }

  swap(updateEntity, 'lock', id, setSubmitting, false, errorMessage);
}

function autoLogInError(id, error) {
  swap(updateEntity, 'lock', id, m => {
    const errorMessage = loginErrorMessage(m, error);
    if (hasScreen(m, 'login')) {
      return setSubmitting(setScreen(m, 'login'), false, errorMessage);
    } else {
      return setSubmitting(m, false, errorMessage);
    }
  });
}

export function resetPassword(id) {
  validateAndSubmit(id, ['email'], m => {
    const params = {
      connection: databaseConnectionName(m),
      email: c.getFieldValue(m, 'email')
    };

    webApi.resetPassword(id, params, (error, ...args) => {
      if (error) {
        setTimeout(() => resetPasswordError(id, error), 250);
      } else {
        resetPasswordSuccess(id);
      }
    });
  });
}

function resetPasswordSuccess(id) {
  const m = read(getEntity, 'lock', id);
  if (hasScreen(m, 'login')) {
    swap(
      updateEntity,
      'lock',
      id,
      m => setScreen(setSubmitting(m, false), 'login', ['']) // array with one empty string tells the function to not clear any field
    );

    // TODO: should be handled by box
    setTimeout(() => {
      const successMessage = i18n.html(m, ['success', 'forgotPassword']);
      swap(updateEntity, 'lock', id, setGlobalSuccess, successMessage);
    }, 500);
  } else {
    if (ui.autoclose(m)) {
      closeLock(id);
    } else {
      swap(updateEntity, 'lock', id, m => setSubmitting(m, false).set('passwordResetted', true));
    }
  }
}

function resetPasswordError(id, error) {
  const m = read(getEntity, 'lock', id);

  const errorMessage =
    i18n.html(m, ['error', 'forgotPassword', error.code]) ||
    i18n.html(m, ['error', 'forgotPassword', 'lock.fallback']);

  swap(updateEntity, 'lock', id, setSubmitting, false, errorMessage);
}

export function showLoginActivity(id, fields = ['password']) {
  swap(updateEntity, 'lock', id, setScreen, 'login', fields);
}

export function showSignUpActivity(id, fields = ['password']) {
  swap(updateEntity, 'lock', id, setScreen, 'signUp', fields);
}

export function showResetPasswordActivity(id, fields = ['password']) {
  swap(updateEntity, 'lock', id, setScreen, 'forgotPassword', fields);
}

export function cancelResetPassword(id) {
  return showLoginActivity(id);
}

export function cancelMFALogin(id) {
  return showLoginActivity(id);
}

export function toggleTermsAcceptance(id) {
  swap(updateEntity, 'lock', id, internalToggleTermsAcceptance);
}

export function showLoginMFAActivity(id, fields = ['mfa_code']) {
  swap(updateEntity, 'lock', id, setScreen, 'mfaLogin', fields);
}

/**
 * Get a new challenge and display the new captcha image.
 *
 * @param {number} id The id of the Lock instance.
 * @param {boolean} wasInvalid A boolean indicating if the previous captcha was invalid.
 * @param {Function} [next] A callback.
 */
export function swapCaptcha(id, wasInvalid, next) {
  return webApi.getChallenge(id, (err, newCaptcha) => {
    if (!err && newCaptcha) {
      swap(updateEntity, 'lock', id, setCaptcha, newCaptcha, wasInvalid);
    }
    if (next) {
      next();
    }
  });
}

/**
 * Display the error message of missing captcha in the header of lock.
 *
 * @param {Object} m model
 * @param {Number} id
 */
function showMissingCaptcha(m, id) {
  const captchaConfig = captcha(m);
  const captchaError =
    captchaConfig.get('provider') === 'recaptcha_v2' ? 'invalid_recaptcha' : 'invalid_captcha';
  const errorMessage = i18n.html(m, ['error', 'login', captchaError]);
  swap(updateEntity, 'lock', id, m => {
    m = setSubmitting(m, false, errorMessage);
    return c.showInvalidField(m, 'captcha');
  });
  return m;
}

/**
 * Set the captcha value in the fields object before sending the request.
 *
 * @param {Object} m model
 * @param {Object} params
 * @param {Object} fields
 *
 * @returns {Boolean} returns true if is required and missing the response from the user
 */
function setCaptchaParams(m, params, fields) {
  const captchaConfig = captcha(m);
  const isCaptchaRequired = captchaConfig && captcha(m).get('required');
  if (!isCaptchaRequired) {
    return true;
  }
  const captchaValue = c.getFieldValue(m, 'captcha');
  //captcha required and missing
  if (!captchaValue) {
    return false;
  }

  params['captcha'] = captchaValue;
  fields.push('captcha');
  return true;
}
