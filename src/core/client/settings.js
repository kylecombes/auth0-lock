import urljoin from 'url-join';
import { load } from '../../utils/cdn_utils';
import { filterConnections, runHook } from '../index';
import { initClient } from './index';

export function fetchClientSettings(clientID, clientBaseUrl, cb) {
  load({
    method: 'setClient',
    url: urljoin(clientBaseUrl, 'client', `${clientID}.js?t${+new Date()}`),
    check: o => o && o.id === clientID,
    cb: cb
  });
}

export function syncClientSettingsSuccess(m, result) {
  m = initClient(m, result);
  m = filterConnections(m);
  m = runHook(m, 'didReceiveClientSettings');
  return m;
}
