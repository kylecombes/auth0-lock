import React from 'react';
import { changeField, startOptionSelection } from './actions';
import { getFieldInvalidHint, getFieldLabel, getFieldValue, isFieldVisiblyInvalid } from './index';
import TextInput from '../ui/input/text_input';
import SelectInput from '../ui/input/select_input';
import CheckboxInput from '../ui/input/checkbox_input';

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

const CustomInput = ({
  iconUrl,
  model,
  name,
  ariaLabel,
  placeholder,
  placeholderHTML,
  type,
  validator,
  value
}) => {
  const props = {
    iconUrl,
    isValid: !isFieldVisiblyInvalid(model, name),
    name,
    ariaLabel,
    placeholder
  };

  switch (type) {
    case 'select':
      return (
        <SelectInput
          {...props}
          lockId={id(model)}
          label={getFieldLabel(model, name)}
          onClick={() => startOptionSelection(id(model), name, iconUrl)}
        />
      );
    case 'checkbox':
      return (
        <CheckboxInput
          lockId={id(model)}
          onChange={e => changeField(id(model), name, `${e.target.checked}`, validator)}
          checked={getFieldValue(model, name)}
          placeholderHTML={placeholderHTML}
          {...props}
        />
      );
    case 'hidden':
      return <input id={id(model)} type="hidden" value={value} name={name} />;
    default:
      return (
        <TextInput
          lockId={id(model)}
          invalidHint={getFieldInvalidHint(model, name)}
          onChange={e => changeField(id(model), name, e.target.value, validator)}
          value={getFieldValue(model, name)}
          {...props}
        />
      );
  }
};

export default CustomInput;
