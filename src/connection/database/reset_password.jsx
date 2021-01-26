import React from 'react';
import Screen from '../../core/screen';
import ResetPasswordPane from './reset_password_pane';
import { authWithUsername, hasScreen } from './index';
import { cancelResetPassword, resetPassword } from './actions';
import { renderPasswordResetConfirmation } from './password_reset_confirmation';
import { databaseUsernameValue } from '../../connection/database/index';
import { isEnterpriseDomain } from '../../connection/enterprise';
import * as i18n from '../../i18n';

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
import { swap, updateEntity } from '../../store/index';

const Component = ({ i18n, model }) => {
  const headerText = i18n.html('forgotPasswordInstructions') || null;
  const header = headerText && <p>{headerText}</p>;

  return (
    <ResetPasswordPane
      emailInputPlaceholder={i18n.str('emailInputPlaceholder')}
      header={header}
      i18n={i18n}
      lock={model}
    />
  );
};

export default class ResetPassword extends Screen {
  constructor() {
    super('forgotPassword');
  }

  backHandler(m) {
    return hasScreen(m, 'login') ? cancelResetPassword : undefined;
  }

  submitButtonLabel(m) {
    return i18n.str(m, ['forgotPasswordSubmitLabel']);
  }

  getScreenTitle(m) {
    return i18n.str(m, 'forgotPasswordTitle');
  }
  isSubmitDisabled(m) {
    const tryingToResetPasswordWithEnterpriseEmail = isEnterpriseDomain(
      m,
      databaseUsernameValue(m, { emailFirst: true })
    );
    if (tryingToResetPasswordWithEnterpriseEmail) {
      setTimeout(() => {
        swap(
          updateEntity,
          'lock',
          id(m),
          setGlobalError,
          i18n.str(m, ['error', 'forgotPassword', 'enterprise_email'])
        );
      }, 50);
    } else {
      swap(updateEntity, 'lock', id(m), clearGlobalError);
    }
    return tryingToResetPasswordWithEnterpriseEmail;
  }

  submitHandler() {
    return resetPassword;
  }

  renderAuxiliaryPane(m) {
    return renderPasswordResetConfirmation(m);
  }

  render() {
    return Component;
  }
}
