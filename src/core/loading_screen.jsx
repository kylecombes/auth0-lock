import PropTypes from 'prop-types';
import React from 'react';
import Screen from './screen';
import { pinLoadingPane, unpinLoadingPane } from './actions';

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
} from './index';

export default class LoadingScreen extends Screen {
  constructor() {
    super('loading');
  }

  render() {
    return LoadingPane;
  }
}

class LoadingPane extends React.Component {
  componentDidMount() {
    const { model } = this.props;
    pinLoadingPane(id(model));
    setTimeout(() => unpinLoadingPane(id(model)), 500);
  }

  render() {
    return (
      <div className="auth0-loading-screen">
        <div className="auth0-loading-container">
          <div className="auth0-loading" />
        </div>
      </div>
    );
  }
}

LoadingPane.propTypes = {
  model: PropTypes.object.isRequired
};
