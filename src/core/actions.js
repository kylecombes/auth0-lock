import Immutable, { Map } from 'immutable';
import webApi from './web_api';
import {
  getCollection,
  getEntity,
  read,
  removeEntity,
  swap,
  setEntity,
  updateEntity
} from '../store/index';
import { syncRemoteData } from './remote_data';
import {
  setup,
  withAuthOptions,
  runHook,
  ui,
  auth,
  emitAuthenticatedEvent,
  emitAuthorizationErrorEvent,
  emitEvent,
  emitHashParsedEvent,
  emitUnrecoverableErrorEvent,
  filterConnections,
  loginErrorMessage,
  overrideOptions,
  render,
  rendering,
  id,
  hashCleanup,
  submitting,
  reset,
  setLoggedIn,
  setSubmitting,
  stopRendering
} from './index';
import { img as preload } from '../utils/preload_utils';
import { defaultProps } from '../ui/box/container';
import { isFieldValid, showInvalidField, hideInvalidFields, clearFields } from '../field/index';

export function setupLock(id, clientID, domain, options, hookRunner, emitEventFn, handleEventFn) {
  let m = setup(id, clientID, domain, options, hookRunner, emitEventFn, handleEventFn);

  m = syncRemoteData(m);

  preload(ui.logo(m) || defaultProps.logo);

  webApi.setupClient(
    id,
    clientID,
    domain,
    withAuthOptions(m, {
      ...options,
      popupOptions: ui.popupOptions(m)
    })
  );

  m = runHook(m, 'didInitialize', options);

  swap(setEntity, 'lock', id, m);

  return m;
}

export function handleAuthCallback() {
  const ms = read(getCollection, 'lock');
  const keepHash = ms.filter(m => !hashCleanup(m)).size > 0;
  const urlWithoutHash = global.location.href.split('#')[0];
  const callback = (error, authResult) => {
    const parsed = !!(error || authResult);
    if (parsed && !keepHash) {
      global.history.replaceState(null, '', urlWithoutHash);
    }
  };
  resumeAuth(global.location.hash, callback);
}

export function resumeAuth(hash, callback) {
  const ms = read(getCollection, 'lock');
  ms.forEach(m => auth.redirect(m) && parseHash(m, hash, callback));
}

function parseHash(m, hash, cb) {
  webApi.parseHash(id(m), hash, function(error, authResult) {
    if (error) {
      emitHashParsedEvent(m, error);
    } else {
      emitHashParsedEvent(m, authResult);
    }

    if (error) {
      emitAuthorizationErrorEvent(m, error);
    } else if (authResult) {
      emitAuthenticatedEvent(m, authResult);
    }
    cb(error, authResult);
  });
}

export function openLock(id, opts) {
  const m = read(getEntity, 'lock', id);
  if (!m) {
    throw new Error("The Lock can't be opened again after it has been destroyed");
  }

  if (rendering(m)) {
    return false;
  }

  if (opts.flashMessage) {
    const supportedTypes = ['error', 'success', 'info'];
    if (!opts.flashMessage.type || supportedTypes.indexOf(opts.flashMessage.type) === -1) {
      return emitUnrecoverableErrorEvent(
        m,
        "'flashMessage' must provide a valid type ['error','success','info']"
      );
    }
    if (!opts.flashMessage.text) {
      return emitUnrecoverableErrorEvent(m, "'flashMessage' must provide a text");
    }
  }

  emitEvent(m, 'show');

  swap(updateEntity, 'lock', id, m => {
    m = overrideOptions(m, opts);
    m = filterConnections(m);
    m = runHook(m, 'willShow', opts);
    return render(m);
  });

  return true;
}

export function closeLock(id, force = false, callback = () => {}) {
  // Do nothing when the Lock can't be closed, unless closing is forced.
  let m = read(getEntity, 'lock', id);
  if ((!ui.closable(m) && !force) || !rendering(m)) {
    return;
  }

  emitEvent(m, 'hide');

  // If it is a modal, stop rendering an reset after a second,
  // otherwise just reset.
  if (ui.appendContainer(m)) {
    swap(updateEntity, 'lock', id, stopRendering);

    setTimeout(() => {
      swap(updateEntity, 'lock', id, m => {
        m = hideInvalidFields(m);
        m = reset(m);
        m = clearFields(m);
        return m;
      });
      m = read(getEntity, 'lock', id);
      callback(m);
    }, 1000);
  } else {
    swap(updateEntity, 'lock', id, m => {
      m = hideInvalidFields(m);
      m = reset(m);
      m = clearFields(m);
      return m;
    });
    callback(m);
  }
}

export function removeLock(id) {
  swap(updateEntity, 'lock', id, stopRendering);
  swap(removeEntity, 'lock', id);
}

export function updateLock(id, f) {
  return swap(updateEntity, 'lock', id, f);
}

export function pinLoadingPane(id) {
  const lock = read(getEntity, 'lock', id);
  if (!lock.get('isLoadingPanePinned')) {
    swap(updateEntity, 'lock', id, m => m.set('isLoadingPanePinned', true));
  }
}

export function unpinLoadingPane(id) {
  swap(updateEntity, 'lock', id, m => m.set('isLoadingPanePinned', false));
}

export function validateAndSubmit(id, fields = [], f) {
  swap(updateEntity, 'lock', id, m => {
    const allFieldsValid = fields.reduce((r, x) => r && isFieldValid(m, x), true);
    return allFieldsValid
      ? setSubmitting(m, true)
      : fields.reduce((r, x) => showInvalidField(r, x), m);
  });
  const m = read(getEntity, 'lock', id);
  if (submitting(m)) {
    f(m);
  }
}

export function logIn(
  id,
  fields,
  params = {},
  logInErrorHandler = (_id, error, _fields, next) => next()
) {
  validateAndSubmit(id, fields, m => {
    webApi.logIn(id, params, auth.params(m).toJS(), (error, result) => {
      if (error) {
        setTimeout(() => logInError(id, fields, error, logInErrorHandler), 250);
      } else {
        logInSuccess(id, result);
      }
    });
  });
}

export function checkSession(id, params = {}) {
  const m = read(getEntity, 'lock', id);
  swap(updateEntity, 'lock', id, m => setSubmitting(m, true));
  webApi.checkSession(id, params, (err, result) => {
    if (err) {
      return logInError(id, [], err);
    }
    return logInSuccess(id, result);
  });
}

export function logInSuccess(id, result) {
  const m = read(getEntity, 'lock', id);

  if (!ui.autoclose(m)) {
    swap(updateEntity, 'lock', id, m => {
      m = setSubmitting(m, false);
      return setLoggedIn(m, true);
    });
    emitAuthenticatedEvent(m, result);
  } else {
    closeLock(id, false, m1 => emitAuthenticatedEvent(m1, result));
  }
}

function logInError(id, fields, error, localHandler = (_id, _error, _fields, next) => next()) {
  const errorCode = error.error || error.code;
  localHandler(id, error, fields, () =>
    setTimeout(() => {
      const m = read(getEntity, 'lock', id);
      const errorMessage = loginErrorMessage(m, error, loginType(fields));
      const errorCodesThatEmitAuthorizationErrorEvent = [
        'blocked_user',
        'rule_error',
        'lock.unauthorized',
        'invalid_user_password',
        'login_required'
      ];

      if (errorCodesThatEmitAuthorizationErrorEvent.indexOf(errorCode) > -1) {
        emitAuthorizationErrorEvent(m, error);
      }

      swap(updateEntity, 'lock', id, setSubmitting, false, errorMessage);
    }, 0)
  );

  swap(updateEntity, 'lock', id, setSubmitting, false);
}

function loginType(fields) {
  if (!fields) return;
  if (~fields.indexOf('vcode')) return 'code';
  if (~fields.indexOf('username')) return 'username';
  if (~fields.indexOf('email')) return 'email';
}
