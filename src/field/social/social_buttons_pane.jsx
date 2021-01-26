import PropTypes from 'prop-types';
import React from 'react';
import AuthButton from '../../ui/button/auth_button';

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
import { logIn } from '../../quick-auth/actions';
import { displayName, socialConnections, authButtonsTheme } from '../../connection/social/index';
import { emitFederatedLoginEvent } from './event';
import { termsAccepted } from '../../connection/database/index';
import { signUpError } from '../../connection/database/actions';

export default class SocialButtonsPane extends React.Component {
  handleSubmit(lock, provider, isSignUp) {
    if (isSignUp && !termsAccepted(lock)) {
      return signUpError(lock.get('id'), { code: 'social_signup_needs_terms_acception' });
    }
    emitFederatedLoginEvent(this.props.lock, provider, isSignUp);
    return logIn(id(this.props.lock), provider);
  }

  render() {
    // TODO: i don't like that it receives the instructions tanslated
    // but it also takes the t fn
    const { instructions, labelFn, lock, showLoading, signUp } = this.props;

    const headerText = instructions || null;
    const header = headerText && <p>{headerText}</p>;

    const themes = authButtonsTheme(lock);

    const buttons = socialConnections(lock).map(x => {
      const buttonTheme = themes.get(x.get('name'));
      const connectionName = buttonTheme && buttonTheme.get('displayName');
      const primaryColor = buttonTheme && buttonTheme.get('primaryColor');
      const foregroundColor = buttonTheme && buttonTheme.get('foregroundColor');
      const icon = buttonTheme && buttonTheme.get('icon');

      return (
        <AuthButton
          key={x.get('name')}
          label={labelFn(
            signUp ? 'signUpWithLabel' : 'loginWithLabel',
            connectionName || displayName(x)
          )}
          onClick={() => this.handleSubmit(lock, x, signUp)}
          strategy={x.get('strategy')}
          primaryColor={primaryColor}
          foregroundColor={foregroundColor}
          icon={icon}
        />
      );
    });

    const loading = showLoading && (
      <div className="auth0-loading-container">
        <div className="auth0-loading" />
      </div>
    );

    return (
      <div className="auth-lock-social-buttons-pane">
        {header}
        <div className="auth0-lock-social-buttons-container">{buttons}</div>
        {loading}
      </div>
    );
  }
}

SocialButtonsPane.propTypes = {
  instructions: PropTypes.any,
  labelFn: PropTypes.func.isRequired,
  lock: PropTypes.object.isRequired,
  showLoading: PropTypes.bool.isRequired,
  signUp: PropTypes.bool.isRequired,
  e: PropTypes.bool
};

SocialButtonsPane.defaultProps = {
  showLoading: false,
  e: false
};
