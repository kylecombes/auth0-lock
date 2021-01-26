import Immutable from 'immutable';
import { fetchClientSettings, syncClientSettingsSuccess } from './client/settings';
import { fetchTenantSettings, syncTenantSettingsSuccess } from './tenant/settings';
import { fetchSSOData } from './sso/data';
import { useTenantInfo, tenantBaseUrl, clientBaseUrl, clientID, auth, id, warn, ui } from './index';
import { isADEnabled } from '../connection/enterprise'; // shouldn't depend on this
import sync, { isSuccess } from '../sync';
import webApi from './web_api';
import { setCaptcha } from '../core/index';

export function syncRemoteData(m) {
  if (useTenantInfo(m)) {
    m = sync(m, 'client', {
      syncFn: (m, cb) => fetchTenantSettings(tenantBaseUrl(m), cb),
      successFn: (m, result) => syncTenantSettingsSuccess(m, clientID(m), result)
    });
  } else {
    m = sync(m, 'client', {
      syncFn: (m, cb) => fetchClientSettings(clientID(m), clientBaseUrl(m), cb),
      successFn: syncClientSettingsSuccess
    });
  }

  m = sync(m, 'sso', {
    conditionFn: m => auth.sso(m) && ui.rememberLastLogin(m),
    waitFn: m => isSuccess(m, 'client'),
    syncFn: (m, cb) => fetchSSOData(id(m), isADEnabled(m), cb),
    successFn: (m, result) => m.mergeIn(['sso'], Immutable.fromJS(result)),
    errorFn: (m, error) => {
      if (error.error === 'consent_required') {
        warn(m, error.error_description);
      } else {
        // location.origin is not supported in all browsers
        let origin = location.protocol + '//' + location.hostname;
        if (location.port) {
          origin += ':' + location.port;
        }

        const appSettingsUrl = `https://manage.auth0.com/#/applications/${clientID(m)}/settings`;

        warn(
          m,
          `There was an error fetching the SSO data. This is expected - and not a problem - if the tenant has Seamless SSO enabled. If the tenant doesn't have Seamless SSO enabled, this could simply mean that there was a problem with the network. But, if a "Origin" error has been logged before this warning, please add "${origin}" to the "Allowed Web Origins" list in the Auth0 dashboard: ${appSettingsUrl}`
        );
      }
    }
  });

  m = sync(m, 'captcha', {
    syncFn: (m, cb) => {
      webApi.getChallenge(m.get('id'), (err, r) => {
        cb(null, r);
      });
    },
    successFn: setCaptcha
  });

  return m;
}
