import Immutable from 'immutable';
import flatten from 'flat';

import enDictionary from '../i18n/en';
import esDictionary from '../i18n/es';

import * as sync from '../sync';

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

describe('i18n', () => {
  let syncSpy;
  let langSpy;

  beforeEach(() => {
    syncSpy = jest.spyOn(sync, 'default');

    langSpy = jest.spyOn(ui, 'language').mockImplementation(() => {
      return 'en';
    });
  });

  afterEach(() => {
    syncSpy.mockRestore();
    langSpy.mockRestore();
  });

  describe('load i18n configuration', () => {
    it('should have a defaultDictionary', () => {
      const i18n = require('../i18n');

      // We need to initialize the state
      var m = Immutable.fromJS({});

      // Initialize i18n.
      const initialized = i18n.initI18n(m);

      let language = flatten(initialized.getIn(['i18n', 'strings']).toJS());
      const en = flatten(enDictionary);

      expect(language).toEqual(en);
    });
  });

  describe('when en language is selected', () => {
    it('should allow check for external en dictionaries', () => {
      const i18n = require('../i18n');

      i18n.initI18n(Immutable.fromJS({}));
      expect(syncSpy).toHaveBeenCalledTimes(1);
    });
  });
});
