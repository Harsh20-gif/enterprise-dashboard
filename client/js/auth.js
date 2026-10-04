(function () {
  const SESSION_KEY = 'northstar-demo-session';
  const DEMO_ACCOUNT = Object.freeze({
    email: 'admin@northstar.test',
    password: 'DashboardDemo2026!',
    name: 'Alex Morgan',
    role: 'Demo administrator'
  });

  try {
    const savedTheme = localStorage.getItem('northstar-theme');
    if (savedTheme === 'light' || savedTheme === 'dark') document.documentElement.dataset.theme = savedTheme;
  } catch {
    // Theme remains governed by the system preference when storage is unavailable.
  }

  const readSession = () => {
    try {
      const value = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
      if (value && value.email === DEMO_ACCOUNT.email && typeof value.name === 'string') return value;
    } catch (error) {
      console.warn('Unable to restore the demo session:', error instanceof Error ? error.name : 'StorageError');
    }
    return null;
  };

  const getNextPage = () => {
    const next = new URLSearchParams(window.location.search).get('next');
    if (!next || !/^(index|products|manage-products|users|reports|settings)\.html$/.test(next)) return 'index.html';
    return next;
  };

  const session = readSession();
  if (document.body.dataset.page === 'login') {
    if (session) {
      window.location.replace(getNextPage());
      return;
    }
    const form = document.querySelector('[data-login-form]');
    const feedback = document.querySelector('[data-login-feedback]');
    const emailInput = document.querySelector('#login-email');
    const passwordInput = document.querySelector('#login-password');
    const demoCredentials = document.querySelector('[data-demo-credentials]');

    if (demoCredentials) {
      demoCredentials.textContent = `Demo account: ${DEMO_ACCOUNT.email} / ${DEMO_ACCOUNT.password}`;
    }
    [emailInput, passwordInput].forEach((input) => input?.addEventListener('input', () => {
      input.removeAttribute('aria-invalid');
      feedback.textContent = '';
    }));
    form?.addEventListener('submit', (event) => {
      event.preventDefault();
      emailInput.removeAttribute('aria-invalid');
      passwordInput.removeAttribute('aria-invalid');
      if (!form.reportValidity()) return;

      if (emailInput.value.trim().toLowerCase() !== DEMO_ACCOUNT.email || passwordInput.value !== DEMO_ACCOUNT.password) {
        feedback.textContent = 'Those demo credentials do not match. Use the credentials shown below.';
        emailInput.setAttribute('aria-invalid', 'true');
        passwordInput.setAttribute('aria-invalid', 'true');
        passwordInput.focus();
        return;
      }

      try {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify({
          email: DEMO_ACCOUNT.email,
          name: DEMO_ACCOUNT.name,
          role: DEMO_ACCOUNT.role,
          signedInAt: new Date().toISOString()
        }));
      } catch {
        feedback.textContent = 'Session storage is unavailable in this browser. Enable site storage and try again.';
        return;
      }
      window.location.replace(getNextPage());
    });
    return;
  }

  if (!session) {
    const requested = `${window.location.pathname.split('/').pop()}${window.location.search}`;
    document.documentElement.dataset.authenticated = 'false';
    window.location.replace(`login.html?next=${encodeURIComponent(requested)}`);
    return;
  }

  document.documentElement.dataset.authenticated = 'true';
  document.querySelectorAll('[data-profile-name], .profile-copy strong').forEach((element) => {
    element.textContent = session.name;
  });
  document.querySelectorAll('[data-profile-role], .profile-copy span').forEach((element) => {
    element.textContent = session.role;
  });
  document.querySelectorAll('.profile-avatar').forEach((element) => {
    element.textContent = session.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  });
  const profileMenu = document.querySelector('.profile-menu');
  if (profileMenu && !profileMenu.querySelector('[data-logout]')) {
    const logoutButton = document.createElement('button');
    logoutButton.className = 'button button-secondary logout-button';
    logoutButton.type = 'button';
    logoutButton.dataset.logout = '';
    logoutButton.textContent = 'Log out';
    logoutButton.setAttribute('aria-label', `Log out ${session.name}`);
    profileMenu.append(logoutButton);
  }
  document.querySelectorAll('[data-logout]').forEach((button) => {
    button.addEventListener('click', () => {
      try {
        sessionStorage.removeItem(SESSION_KEY);
      } catch (error) {
        console.warn('Unable to clear the demo session:', error instanceof Error ? error.name : 'StorageError');
      }
      window.location.replace('login.html');
    });
  });
}());