import expect from 'expect.js';
import Immutable from 'immutable';

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
} from '../../src/core/index';

let lock;

const clientID = 'someClientID';
const lockID = 'someLockID';
const domain = 'tenant.auth0.com';

describe('initializing a lock', function() {
  beforeEach(function() {
    lock = setup({
      clientID: clientID,
      domain: domain,
      id: lockID,
      nonexistent: 'nonexistent'
    });
  });

  it('sets the id', function() {
    expect(id(lock)).to.be(lockID);
  });

  it('sets the client id', function() {
    expect(clientID(lock)).to.be(clientID);
  });

  it('sets the domain', function() {
    expect(domain(lock)).to.be(domain);
  });

  it("doesn't set unknown attributes", function() {
    expect(lock.get('nonexistent')).to.be(undefined);
  });

  it("doesn't set any mode", function() {
    expect(modeName(lock)).to.be(undefined);
  });

  it("doesn't need to be shown", function() {
    expect(show(lock)).to.be(false);
  });

  it("isn't submitting", function() {
    expect(submitting(lock)).to.be(false);
  });

  it("doesn't have a global error", function() {
    expect(globalError(lock)).to.be('');
  });

  it("doesn't need to be rendered", function() {
    expect(rendering(lock)).to.be(false);
  });
});

describe('rendering a lock', function() {
  let renderedLock;
  const modeName = 'someMode';
  const modeOptions = { someModeOption: 'someModeOption' };

  beforeEach(function() {
    lock = setup({ clientID: clientID, domain: domain, id: lockID });
    renderedLock = render(lock, modeName, { mode: modeOptions });
  });

  it('sets the mode', function() {
    expect(modeName(renderedLock)).to.be(modeName);
  });

  it('sets the mode options', function() {
    const assginedModeOptions = Immutable.fromJS(modeOptions).toJS();
    assginedModeOptions.name = modeName;
    expect(modeOptions(renderedLock).toJS()).to.eql(assginedModeOptions);
  });

  it("it isn't being shown yet", function() {
    expect(show(renderedLock)).to.be(false);
  });

  it('needs to be rendered', function() {
    expect(rendering(renderedLock)).to.be(true);
  });

  it('choses a container id automatically', function() {
    expect(ui.containerID(renderedLock)).to.be(`auth0-lock-container-${id(lock)}`);
  });

  it('can append a container when needed', function() {
    expect(ui.appendContainer(renderedLock)).to.be(true);
  });

  it('uses the auth0 logo', function() {
    expect(ui.icon(renderedLock)).to.be(
      '//cdn.auth0.com/styleguide/components/1.0.8/media/logos/img/badge.png'
    );
  });

  it('can be closed', function() {
    expect(ui.closable(renderedLock)).to.be(true);
  });

  // TODO: focusInput test, but remove isSmallScreen dependency first

  it('displays user name and picture obtained from Gravatar', function() {
    expect(ui.gravatar(renderedLock)).to.be(true);
  });

  describe('with ui option', function() {
    describe('`container`', function() {
      const container = 'someId';

      beforeEach(function() {
        renderedLock = render(lock, modeName, { container: container });
      });

      it('assigns it as the container id', function() {
        expect(ui.containerID(renderedLock)).to.be(container);
      });

      it('prohibits appending a container', function() {
        expect(ui.appendContainer(renderedLock)).to.be(false);
      });

      it("doesn't allow to close it (by default)", function() {
        expect(ui.closable(renderedLock)).to.be(false);
      });

      // TODO: focusInput test, but (again) remove isSmallScreen dependency first
    });

    describe('`appendContainer`', function() {
      beforeEach(function() {
        renderedLock = render(lock, modeName, { appendContainer: false });
      });

      it("doesn't affect whether a container can be appended or not", function() {
        expect(ui.appendContainer(renderedLock)).to.be(true);
      });
    });

    describe('`icon`', function() {
      const icon = 'my_company_icon.svg';

      beforeEach(function() {
        renderedLock = render(lock, modeName, { icon: icon });
      });

      it('sets a customs icon', function() {
        expect(ui.icon(renderedLock)).to.be(icon);
      });
    });

    describe('`closable`', function() {
      describe('without `container`', function() {
        beforeEach(function() {
          renderedLock = render(lock, modeName, { closable: false });
        });

        it('can stop the user from closing the lock', function() {
          expect(ui.closable(renderedLock)).to.be(false);
        });
      });

      describe('with `container`', function() {
        beforeEach(function() {
          renderedLock = render(lock, modeName, { closable: true, container: 'someId' });
        });

        it("it doesn't have any effect (doesn't allow the user to close the lock)", function() {
          expect(ui.closable(renderedLock)).to.be(false);
        });
      });
    });

    // TODO: focusInput test, but (again) remove isSmallScreen dependency first

    describe('`gravatar`', function() {
      beforeEach(function() {
        renderedLock = render(lock, modeName, { gravatar: false });
      });

      it("doesn't display user name and picture obtained from Gravatar", function() {
        expect(ui.gravatar(renderedLock)).to.be(false);
      });
    });
  });

  describe('then opening it', function() {
    let openedLock;
    beforeEach(function() {
      openedLock = setShow(renderedLock, true);
    });

    it('needs to be shown now', function() {
      expect(show(openedLock)).to.be(true);
    });

    describe('and closing it', function() {
      let closedLock;
      beforeEach(function() {
        closedLock = close(openedLock);
      });

      it("doesn't need to be shown anymore", function() {
        expect(show(closedLock)).to.be(false);
      });

      it('still needs to be rendered', function() {
        expect(rendering(closedLock)).to.be(true);
      });
    });
  });
});

describe('rerendering a lock', function() {
  let renderedLock, reRenderedLock;
  const modeName = 'someMode';

  beforeEach(function() {
    lock = setup({ clientID: clientID, domain: domain, id: lockID });
    renderedLock = render(lock, modeName, {});
    reRenderedLock = render(renderedLock, modeName, {});
  });

  it("doesn't change the container id", function() {
    expect(ui.containerID(reRenderedLock)).to.be(ui.containerID(renderedLock));
  });

  it("doesn't change whether it allows to append a container or not", function() {
    expect(ui.appendContainer(reRenderedLock)).to.be(ui.appendContainer(renderedLock));
  });

  it("doesn't change the icon", function() {
    expect(ui.icon(reRenderedLock)).to.be(ui.icon(renderedLock));
  });

  it("doesn't change whether it can be closed or not", function() {
    expect(ui.closable(reRenderedLock)).to.be(ui.closable(renderedLock));
  });

  // TODO: focusInput test, but (again) remove isSmallScreen dependency first

  it("doesn't change whether it displays info obtained from Gravatar or not", function() {
    expect(ui.gravatar(reRenderedLock)).to.be(ui.gravatar(renderedLock));
  });

  describe('with UI option', function() {
    const reopenOptions = {
      container: 'someId',
      icon: 'my_company_icon.svg',
      closable: false,
      gravatar: false
    };

    describe('`container`', function() {
      beforeEach(function() {
        reRenderedLock = render(renderedLock, modeName, { container: reopenOptions.container });
      });

      it("doesn't change the container's id", function() {
        expect(ui.containerID(reRenderedLock)).to.be(ui.containerID(renderedLock));
        expect(ui.containerID(reRenderedLock)).to.not.be(reopenOptions.container); // sanity check
      });

      it("doesn't affect whether a container can be appended or not", function() {
        expect(ui.appendContainer(reRenderedLock)).to.be(ui.appendContainer(renderedLock));
        expect(ui.appendContainer(reRenderedLock)).to.be(true); // sanity check
      });

      it("doesn't change whether it can be closed or not", function() {
        expect(ui.closable(reRenderedLock)).to.be(ui.closable(renderedLock));
        expect(ui.closable(reRenderedLock)).to.be(true); // sanity check
      });
    });

    describe('`appendContainer`', function() {
      beforeEach(function() {
        reRenderedLock = render(renderedLock, modeName, { appendContainer: false });
      });

      it("doesn't affect whether a container can be appended or not", function() {
        expect(ui.appendContainer(reRenderedLock)).to.be(ui.appendContainer(renderedLock));
        expect(ui.appendContainer(reRenderedLock)).to.be(true); // sanity check
      });
    });

    describe('`icon`', function() {
      beforeEach(function() {
        reRenderedLock = render(renderedLock, modeName, { icon: reopenOptions.icon });
      });

      it('changes the icon', function() {
        expect(ui.icon(reRenderedLock)).to.be(reopenOptions.icon);
        expect(ui.icon(renderedLock)).to.not.be(reopenOptions.icon); // sanity check
      });
    });

    describe('`closable`', function() {
      beforeEach(function() {
        reRenderedLock = render(renderedLock, modeName, { closable: reopenOptions.closable });
      });

      it('changes whether it can be closed or not', function() {
        expect(ui.closable(reRenderedLock)).to.be(reopenOptions.closable);
        expect(ui.closable(renderedLock)).to.not.be(reopenOptions.closable); // sanity check
      });
    });

    // TODO: focusInput test, but (again) remove isSmallScreen dependency first

    describe('`gravatar`', function() {
      beforeEach(function() {
        reRenderedLock = render(renderedLock, modeName, { gravatar: reopenOptions.gravatar });
      });

      it('changes whether it displays info obtained from Gravatar or not', function() {
        expect(ui.gravatar(reRenderedLock)).to.be(reopenOptions.gravatar);
        expect(ui.gravatar(renderedLock)).to.not.be(reopenOptions.gravatar); // sanity check
      });
    });
  });

  describe('in another mode', function() {
    const otherModeName = 'otherMode';
    let notRerenderedLock;

    beforeEach(function() {
      notRerenderedLock = render(reRenderedLock, otherModeName, { gravatar: false });
    });

    it("doesn't change anything", function() {
      expect(reRenderedLock).to.be(notRerenderedLock);
    });
  });
});

describe('trying to render a lock that is being shown', function() {
  let openedLock, reRenderedLock;
  const modeName = 'someMode';

  beforeEach(function() {
    lock = setup({ clientID: clientID, domain: domain, id: lockID });
    openedLock = setShow(render(lock, modeName, {}), true);
    reRenderedLock = render(openedLock, modeName, { gravatar: false });
  });

  it("doesn't change anything", function() {
    expect(reRenderedLock).to.be(openedLock);
  });
});

describe('submitting', function() {
  let lockWithGlobalError, submittingLock;
  const globalError = 'Something went wrong.';

  beforeEach(function() {
    lock = setup({ clientID: clientID, domain: domain, id: lockID });
    lockWithGlobalError = setGlobalError(lock, globalError);
    submittingLock = setSubmitting(lockWithGlobalError, true);
  });

  it('updates the submit status', function() {
    expect(submitting(submittingLock)).to.be(true);
    expect(submitting(lockWithGlobalError)).to.be(false); // sanity check
  });

  it('clears the global error', function() {
    expect(globalError(submittingLock)).to.be('');
  });

  describe('providing a global error', function() {
    beforeEach(function() {
      // TODO: this is confusing, split `setSubmitting` into `startSubmit` and
      // `stopSubmit`.
      submittingLock = setSubmitting(lockWithGlobalError, true, globalError);
    });

    it('updates the submit status', function() {
      expect(submitting(submittingLock)).to.be(true);
      expect(submitting(lockWithGlobalError)).to.be(false); // sanity check
    });

    it('clears the global error anyway', function() {
      expect(globalError(submittingLock)).to.be('');
      expect(globalError).to.not.be(''); // sanity check
    });
  });

  describe('a successful request', function() {
    beforeEach(function() {
      submittingLock = setSubmitting(lock, false);
    });

    it('updates the submit status', function() {
      expect(submitting(submittingLock)).to.be(false);
    });

    it("doesn't record any global error", function() {
      expect(globalError(submittingLock)).to.be('');
    });
  });

  describe('an unsuccessful request', function() {
    beforeEach(function() {
      submittingLock = setSubmitting(lock, false, globalError);
    });

    it('updates the submit status', function() {
      expect(submitting(submittingLock)).to.be(false);
    });

    it('records a global error', function() {
      expect(globalError(submittingLock)).to.be(globalError);
    });
  });
});

describe('accessing Gravatar info', function() {
  const gravatar = Immutable.fromJS({ displayName: 'someName', imageUrl: 'someUrl' });
  const modeName = 'someMode';
  let renderedLock;

  beforeEach(function() {
    lock = setup({ clientID: clientID, domain: domain, id: lockID });
  });

  describe('when it has to be displayed', function() {
    beforeEach(function() {
      renderedLock = render(lock, modeName, { gravatar: true });
    });

    describe("and it isn't available", function() {
      it('returns undefined', function() {
        expect(gravatar(renderedLock)).to.be(undefined);
      });
    });

    describe('and it is available', function() {
      beforeEach(function() {
        renderedLock = renderedLock.set('gravatar', gravatar);
      });

      it('returns it', function() {
        expect(gravatar(renderedLock)).to.be(gravatar);
      });
    });
  });

  describe("when available but it doesn't have to be displayed", function() {
    beforeEach(function() {
      renderedLock = render(lock, modeName, { gravatar: false });
      renderedLock = renderedLock.set('gravatar', gravatar);
    });

    it('returns undefined', function() {
      expect(gravatar(renderedLock)).to.be(undefined);
    });
  });
});
