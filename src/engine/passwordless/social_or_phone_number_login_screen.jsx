import React from 'react';
import Screen from '../../core/screen';
import { sendSMS } from '../../connection/passwordless/actions';
import PhoneNumberPane from '../../field/phone-number/phone_number_pane';
import SocialButtonsPane from '../../field/social/social_buttons_pane';
import { renderSignedInConfirmation } from '../../core/signed_in_confirmation';
import PaneSeparator from '../../core/pane_separator';

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

import { renderOptionSelection } from '../../field/index';
import { mustAcceptTerms, termsAccepted, showTerms } from '../../connection/passwordless/index';
import { toggleTermsAcceptance } from '../../connection/passwordless/actions';
import SignUpTerms from '../../connection/database/sign_up_terms';

const Component = ({ i18n, model }) => {
  const social = hasSomeConnections(model, 'social') ? (
    <SocialButtonsPane
      instructions={i18n.html('socialLoginInstructions')}
      labelFn={i18n.str}
      lock={model}
      signUp={true}
    />
  ) : null;

  const phoneNumberInstructionsI18nKey = social
    ? 'passwordlessSMSAlternativeInstructions'
    : 'passwordlessSMSInstructions';

  const phoneNumber = hasSomeConnections(model, 'passwordless', 'sms') ? (
    <PhoneNumberPane
      instructions={i18n.html(phoneNumberInstructionsI18nKey)}
      lock={model}
      placeholder={i18n.str('phoneNumberInputPlaceholder')}
      invalidHint={i18n.str('phoneNumberInputInvalidHint')}
    />
  ) : null;

  const separator = social && phoneNumber ? <PaneSeparator /> : null;

  return (
    <div>
      {social}
      {separator}
      {phoneNumber}
    </div>
  );
};

export default class AskSocialNetworkOrPhoneNumber extends Screen {
  constructor() {
    super('socialOrPhoneNumber');
  }

  submitHandler(m) {
    return hasSomeConnections(m, 'passwordless', 'sms') ? sendSMS : null;
  }

  renderAuxiliaryPane(lock) {
    return renderSignedInConfirmation(lock) || renderOptionSelection(lock);
  }

  render() {
    return Component;
  }
  isSubmitDisabled(m) {
    return !termsAccepted(m);
  }

  renderTerms(m, terms) {
    const checkHandler = mustAcceptTerms(m) ? () => toggleTermsAcceptance(id(m)) : undefined;
    return terms && showTerms(m) ? (
      <SignUpTerms
        showCheckbox={mustAcceptTerms(m)}
        checkHandler={checkHandler}
        checked={termsAccepted(m)}
      >
        {terms}
      </SignUpTerms>
    ) : null;
  }
}
