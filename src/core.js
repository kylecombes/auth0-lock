import { EventEmitter } from 'events';
import { getEntity, observe, read } from './store/index';
import { remove, render } from './ui/box';
import webAPI from './core/web_api';
import {
  closeLock,
  resumeAuth,
  handleAuthCallback,
  openLock,
  removeLock,
  setupLock,
  updateLock
} from './core/actions';

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
} from './core/index';

import * as idu from './utils/id_utils';
import * as i18n from './i18n';

import { go } from './sync';

import css from '../css/index.styl';

export default class Base extends EventEmitter {
  constructor(clientID, domain, options = {}, engine) {
    if (typeof clientID != 'string') {
      throw new Error('A `clientID` string must be provided as first argument.');
    }
    if (typeof domain != 'string') {
      throw new Error('A `domain` string must be provided as second argument.');
    }
    if (typeof options != 'object') {
      throw new Error('When provided, the third argument must be an `options` object.');
    }

    super();

    this.validEvents = [
      'show',
      'hide',
      'unrecoverable_error',
      'authenticated',
      'authorization_error',
      'hash_parsed',
      'signin ready',
      'signup ready',
      'socialOrPhoneNumber ready',
      'socialOrEmail ready',
      'vcode ready',
      'forgot_password ready',
      'forgot_password submit',
      'signin submit',
      'signup submit',
      'signup success',
      'signup error',
      'socialOrPhoneNumber submit',
      'socialOrEmail submit',
      'vcode submit',
      'federated login'
    ];

    this.id = idu.incremental();
    this.engine = engine;
    const hookRunner = ::this.runHook;
    const emitEventFn = this.emit.bind(this);
    const handleEventFn = this.on.bind(this);
    go(this.id);

    let m = setupLock(this.id, clientID, domain, options, hookRunner, emitEventFn, handleEventFn);
    this.on('newListener', type => {
      if (this.validEvents.indexOf(type) === -1) {
        emitUnrecoverableErrorEvent(m, `Invalid event "${type}".`);
      }
    });

    if (auth.autoParseHash(m) && !Base.hasScheduledAuthCallback) {
      Base.hasScheduledAuthCallback = true;
      setTimeout(handleAuthCallback, 0);
    }

    observe('render', this.id, m => {
      const partialApplyId = (screen, handlerName) => {
        const handler = screen[handlerName](m);
        return handler ? (...args) => handler(id(m), ...args) : handler;
      };
      const avatar =
        (ui.avatar(m) && m.getIn(['avatar', 'transient', 'syncStatus']) === 'ok') || null;

      if (rendering(m)) {
        const screen = this.engine.render(m);

        const title = avatar
          ? i18n.str(m, 'welcome', m.getIn(['avatar', 'transient', 'displayName']))
          : screen.getTitle(m);

        const disableSubmitButton = screen.isSubmitDisabled(m);

        const i18nProp = {
          group: keyPath => i18n.group(m, keyPath),
          html: (keyPath, ...args) => i18n.html(m, keyPath, ...args),
          str: (keyPath, ...args) => i18n.str(m, keyPath, ...args)
        };

        const getScreenTitle = m => {
          // if it is the first screen and the flag is enabled, it should hide the title
          return ui.hideMainScreenTitle(m) && screen.isFirstScreen(m) ? null : title;
        };

        const props = {
          avatar: avatar && m.getIn(['avatar', 'transient', 'url']),
          auxiliaryPane: screen.renderAuxiliaryPane(m),
          autofocus: ui.autofocus(m),
          backHandler: partialApplyId(screen, 'backHandler'),
          badgeLink: 'https://auth0.com/?utm_source=lock&utm_campaign=badge&utm_medium=widget',
          closeHandler: ui.closable(m) ? (...args) => closeLock(id(m), ...args) : undefined,
          contentComponent: screen.render(),
          contentProps: { i18n: i18nProp, model: m },
          disableSubmitButton: disableSubmitButton,
          error: globalError(m),
          info: globalInfo(m),
          isMobile: ui.mobile(m),
          isModal: ui.appendContainer(m),
          isSubmitting: submitting(m),
          language: ui.language(m),
          logo: ui.logo(m),
          primaryColor: ui.primaryColor(m),
          screenName: screen.name,
          showBadge: showBadge(m) === true,
          success: globalSuccess(m),
          submitButtonLabel: ui.labeledSubmitButton(m) ? screen.submitButtonLabel(m) : null,
          submitHandler: partialApplyId(screen, 'submitHandler'),
          tabs: screen.renderTabs(m),
          terms: screen.renderTerms(m, i18nProp.html('signUpTerms')),
          title: getScreenTitle(m),
          classNames: screen.name === 'loading' ? 'fade' : 'horizontal-fade',
          scrollGlobalMessagesIntoView: ui.scrollGlobalMessagesIntoView(m),
          suppressSubmitOverlay: suppressSubmitOverlay(m) || false
        };
        render(ui.containerID(m), props);

        // TODO: hack so we can start testing the beta
        if (!this.oldScreenName || this.oldScreenName != screen.name) {
          if (screen.name === 'main.login') {
            emitEvent(m, 'signin ready');
          } else if (screen.name === 'main.signUp') {
            emitEvent(m, 'signup ready');
          } else if (screen.name === 'forgotPassword') {
            emitEvent(m, 'forgot_password ready');
          } else if (screen.name === 'socialOrEmail') {
            emitEvent(m, 'socialOrEmail ready');
          } else if (screen.name === 'socialOrPhoneNumber') {
            emitEvent(m, 'socialOrPhoneNumber ready');
          } else if (screen.name === 'vcode') {
            emitEvent(m, 'vcode ready');
          }
        }
        this.oldScreenName = screen.name;
      } else {
        remove(ui.containerID(m));
      }
    });
  }

  resumeAuth(hash, callback) {
    resumeAuth(hash, callback);
  }

  show(opts = {}) {
    openLock(this.id, opts);
  }

  hide() {
    closeLock(this.id, true);
  }

  destroy() {
    removeLock(this.id);
  }

  getProfile(token, cb) {
    return this.getUserInfo(token, cb);
  }

  getUserInfo(token, cb) {
    return webAPI.getUserInfo(this.id, token, cb);
  }

  checkSession(options, cb) {
    return webAPI.checkSession(this.id, options, cb);
  }

  logout(query = {}) {
    webAPI.logout(this.id, query);
  }

  update(f) {
    return updateLock(this.id, f);
  }

  setModel(m) {
    return this.update(() => m);
  }

  runHook(str, m, ...args) {
    if (typeof this.engine[str] != 'function') return m;
    return this.engine[str](m, ...args);
  }
}

export function injectStyles() {
  const styleId = 'auth0-lock-style';
  let style = document.getElementById(styleId);

  if (!style) {
    const head = document.getElementsByTagName('head')[0];
    style = document.createElement('style');
    style.type = 'text/css';
    style.setAttribute('id', styleId);
    head.appendChild(style);
  }

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.innerHTML = css;
  }
}

/**
 * Calculates the window innerHeight and sets the --vh style property on :root,
 * which is then taken advantage of by the CSS.
 * This important as `innerHeight` will take into account any UI chrome on mobile devices, fixing
 * an issue where the login button is cut off towards the bottom of the screen.
 * Values are in pixels multiplied by 1% to convert them to vh.
 */
export function setWindowHeightStyle() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}
