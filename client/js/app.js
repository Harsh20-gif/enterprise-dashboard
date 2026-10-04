import { addRecentActivity, ensureDemoUsers, readDemoUsers, writeDemoUsers } from './storage.js';

if (document.documentElement.dataset.authenticated === 'true') {
ensureDemoUsers();
const storage = {
  get(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      return false;
    }
    return true;
  }
};

const themeRoot = document.documentElement;
const savedTheme = storage.get('northstar-theme');
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
if (savedTheme === 'light' || savedTheme === 'dark') {
  themeRoot.dataset.theme = savedTheme;
} else {
  delete themeRoot.dataset.theme;
}

const themeInputs = document.querySelectorAll('input[name="theme"]');
const themeToggles = document.querySelectorAll('[data-theme-toggle]');
const currentTheme = () => themeRoot.dataset.theme || (systemTheme.matches ? 'dark' : 'light');
const syncThemeControls = () => {
  const theme = currentTheme();
  themeInputs.forEach((input) => {
    input.checked = input.value === theme;
  });
  themeToggles.forEach((toggle) => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    const label = `Switch to ${nextTheme} theme`;
    toggle.setAttribute('aria-label', label);
    toggle.setAttribute('title', label);
    const icon = toggle.querySelector('[data-theme-icon]');
    if (icon) icon.textContent = theme === 'dark' ? '☀' : '◐';
  });
};
const setTheme = (theme) => {
  themeRoot.dataset.theme = theme;
  storage.set('northstar-theme', theme);
  syncThemeControls();
};

themeToggles.forEach((toggle) => {
  toggle.addEventListener('click', () => setTheme(currentTheme() === 'dark' ? 'light' : 'dark'));
});
themeInputs.forEach((input) => {
  input.addEventListener('change', () => {
    if (input.checked) setTheme(input.value);
  });
});
systemTheme.addEventListener('change', () => {
  if (!storage.get('northstar-theme')) syncThemeControls();
});
syncThemeControls();

const sidebar = document.querySelector('[data-sidebar]');
const menuToggle = document.querySelector('[data-menu-toggle]');
if (sidebar && menuToggle) {
  const mobileViewport = window.matchMedia('(max-width: 767px)');
  const syncSidebar = () => {
    const isOpen = sidebar.classList.contains('is-open');
    sidebar.inert = mobileViewport.matches && !isOpen;
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
  };
  const closeSidebar = (returnFocus = true) => {
    sidebar.classList.remove('is-open');
    syncSidebar();
    if (returnFocus && mobileViewport.matches) menuToggle.focus();
  };

  syncSidebar();
  menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('is-open');
    syncSidebar();
    if (sidebar.classList.contains('is-open')) {
      sidebar.querySelector('a')?.focus();
    }
  });
  mobileViewport.addEventListener('change', () => {
    sidebar.classList.remove('is-open');
    syncSidebar();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && sidebar.classList.contains('is-open')) closeSidebar();
  });
  document.querySelector('.main-content')?.addEventListener('click', () => {
    if (sidebar.classList.contains('is-open')) closeSidebar(false);
  });
  sidebar.addEventListener('click', (event) => {
    if (event.target.closest('a') && mobileViewport.matches) closeSidebar(false);
  });
}

document.addEventListener('keydown', (event) => {
  if (event.key !== '/' || event.altKey || event.ctrlKey || event.metaKey) return;
  const active = document.activeElement;
  if (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement || active?.isContentEditable) return;
  const target = document.querySelector('#catalog-search') || document.querySelector('#global-search') || document.querySelector('#user-search');
  if (target) {
    event.preventDefault();
    target.focus();
  }
});

const userRows = document.querySelector('[data-user-rows]');
if (userRows) {
  const addButton = document.querySelector('[data-add-user]');
  const dialog = document.querySelector('[data-user-dialog]');
  const userForm = document.querySelector('#user-form');
  const userSearch = document.querySelector('#user-search');
  const feedback = document.querySelector('#users-feedback');
  const dialogFeedback = document.querySelector('#dialog-feedback');
  const pageSize = 5;
  let currentPage = 1;
  let returnFocusTarget = addButton;

  const rows = () => Array.from(userRows.querySelectorAll('tr[data-email]'));
  const filteredRows = () => {
    const query = userSearch.value.trim().toLocaleLowerCase();
    return rows().filter((row) => `${row.dataset.name} ${row.dataset.email} ${row.dataset.role}`.toLocaleLowerCase().includes(query));
  };

  const renderRows = () => {
    const matches = filteredRows();
    const pageCount = Math.max(1, Math.ceil(matches.length / pageSize));
    currentPage = Math.min(currentPage, pageCount);
    const firstIndex = (currentPage - 1) * pageSize;
    const pageRows = new Set(matches.slice(firstIndex, firstIndex + pageSize));
    rows().forEach((row) => {
      row.hidden = !pageRows.has(row);
    });

    let emptyRow = userRows.querySelector('[data-empty-row]');
    if (matches.length === 0 && !emptyRow) {
      emptyRow = document.createElement('tr');
      emptyRow.dataset.emptyRow = '';
      const cell = document.createElement('td');
      cell.colSpan = 5;
      cell.textContent = 'No users match this search.';
      emptyRow.append(cell);
      userRows.append(emptyRow);
    } else if (matches.length > 0 && emptyRow) {
      emptyRow.remove();
    }
    if (emptyRow) emptyRow.hidden = matches.length !== 0;

    document.querySelector('[data-user-count]').textContent = String(matches.length);
    document.querySelector('[data-pagination-summary]').textContent = matches.length
      ? `Showing ${firstIndex + 1}-${Math.min(firstIndex + pageSize, matches.length)} of ${matches.length} users`
      : 'No users to show';
    document.querySelector('[data-page-number]').textContent = String(currentPage);
    document.querySelector('[data-page-previous]').disabled = currentPage === 1;
    document.querySelector('[data-page-next]').disabled = currentPage >= pageCount;
  };

  const avatarClass = (name) => {
    const colors = ['avatar-teal', 'avatar-coral', 'avatar-gold', 'avatar-blue', 'avatar-violet'];
    return colors[name.charCodeAt(0) % colors.length];
  };

  const initialsFor = (name) => name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();

  const makeUserRow = ({ name, email, role, status = 'Active', date }) => {
    const row = document.createElement('tr');
    Object.assign(row.dataset, { id: `demo-${email.toLowerCase()}`, name, email, role, status, date });
    const identityCell = document.createElement('td');
    const person = document.createElement('span');
    person.className = 'table-person';
    const avatar = document.createElement('span');
    avatar.className = `small-avatar ${avatarClass(name)}`;
    avatar.setAttribute('aria-hidden', 'true');
    avatar.textContent = initialsFor(name);
    const identity = document.createElement('span');
    const nameText = document.createElement('strong');
    nameText.textContent = name;
    const emailText = document.createElement('small');
    emailText.textContent = email;
    identity.append(nameText, emailText);
    person.append(avatar, identity);
    identityCell.append(person);

    const roleCell = document.createElement('td');
    roleCell.textContent = role;
    const statusCell = document.createElement('td');
    const statusPill = document.createElement('span');
    const statusClass = status.toLowerCase().includes('pending')
      ? 'status-pending'
      : status.toLowerCase() === 'inactive' ? 'status-inactive' : 'status-active';
    statusPill.className = `status-pill ${statusClass}`;
    statusPill.textContent = status;
    statusCell.append(statusPill);
    const dateCell = document.createElement('td');
    dateCell.textContent = date;
    const actionCell = document.createElement('td');
    actionCell.className = 'action-cell';
    const editButton = document.createElement('button');
    editButton.className = 'text-button';
    editButton.type = 'button';
    editButton.dataset.editUser = '';
    editButton.setAttribute('aria-label', `Edit ${name}`);
    editButton.textContent = 'Edit';
    const deleteButton = document.createElement('button');
    deleteButton.className = 'text-button text-danger';
    deleteButton.type = 'button';
    deleteButton.dataset.deleteUser = '';
    deleteButton.setAttribute('aria-label', `Delete ${name}`);
    deleteButton.textContent = 'Delete';
    actionCell.append(editButton, deleteButton);
    row.append(identityCell, roleCell, statusCell, dateCell, actionCell);
    return row;
  };

  const saveUsers = () => {
    const saved = writeDemoUsers(rows().map((row) => ({
      id: row.dataset.id || `demo-${row.dataset.email.toLowerCase()}`,
      name: row.dataset.name,
      email: row.dataset.email,
      role: row.dataset.role,
      status: row.dataset.status,
      date: row.dataset.date
    })));
    document.dispatchEvent(new CustomEvent('northstar:users-change', { detail: readDemoUsers() }));
    return saved;
  };

  const savedUsers = readDemoUsers();
  if (savedUsers.length) {
    userRows.replaceChildren(...savedUsers.map(makeUserRow));
  } else {
    saveUsers();
  }

  const fieldMessages = {
    'user-name': 'Enter a name with at least 2 characters.',
    'user-email': 'Enter a valid email address.',
    'user-role': 'Choose a role for this user.'
  };

  const showFieldError = (control, message) => {
    const error = document.querySelector(`#${control.id.replace('user-', '')}-error`);
    control.setAttribute('aria-invalid', 'true');
    if (error) error.textContent = message;
  };

  const clearFieldError = (control) => {
    control.removeAttribute('aria-invalid');
    const error = document.querySelector(`#${control.id.replace('user-', '')}-error`);
    if (error) error.textContent = '';
  };

  const openUserDialog = (mode, row = null, invoker = addButton) => {
    returnFocusTarget = invoker;
    userForm.reset();
    userForm.querySelectorAll('[aria-invalid="true"]').forEach(clearFieldError);
    dialogFeedback.textContent = '';
    const editing = mode === 'edit';
    document.querySelector('#user-dialog-title').textContent = editing ? 'Edit user' : 'Add user';
    document.querySelector('[data-submit-user]').textContent = editing ? 'Save changes' : 'Add user';
    document.querySelector('#editing-email').value = editing ? row.dataset.email : '';
    document.querySelector('#user-name').value = editing ? row.dataset.name : '';
    document.querySelector('#user-email').value = editing ? row.dataset.email : '';
    document.querySelector('#user-role').value = editing ? row.dataset.role : '';
    document.querySelector('#user-status').value = editing ? row.dataset.status : 'Active';
    dialog.showModal();
    document.querySelector('#user-name').focus();
  };

  addButton.addEventListener('click', () => openUserDialog('add'));
  document.querySelectorAll('[data-close-dialog], [data-cancel-dialog]').forEach((button) => {
    button.addEventListener('click', () => dialog.close());
  });
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      dialog.close();
    }
  });
  dialog.addEventListener('close', () => {
    if (returnFocusTarget?.isConnected) returnFocusTarget.focus();
  });

  userForm.noValidate = true;
  userForm.querySelectorAll('input:not([type="hidden"]), select').forEach((control) => {
    control.addEventListener('input', () => clearFieldError(control));
    control.addEventListener('change', () => clearFieldError(control));
  });
  userForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = document.querySelector('#user-name');
    const email = document.querySelector('#user-email');
    const role = document.querySelector('#user-role');
    const status = document.querySelector('#user-status');
    const oldEmail = document.querySelector('#editing-email').value;
    const errors = [];

    [name, email, role].forEach((control) => {
      if (!control.validity.valid) {
        showFieldError(control, fieldMessages[control.id]);
        errors.push(control);
      }
    });
    if (name.validity.valid && name.value.trim().length < 2) {
      showFieldError(name, fieldMessages[name.id]);
      errors.push(name);
    }
    if (email.validity.valid && rows().some((row) => row.dataset.email.toLowerCase() === email.value.trim().toLowerCase() && row.dataset.email !== oldEmail)) {
      showFieldError(email, 'A user with this email address already exists.');
      errors.push(email);
    }

    if (errors.length) {
      dialogFeedback.textContent = 'Please correct the highlighted fields.';
      errors[0].focus();
      return;
    }

    const existingRow = oldEmail ? rows().find((row) => row.dataset.email === oldEmail) : null;
    const user = {
      name: name.value.trim(),
      email: email.value.trim(),
      role: role.value,
      status: status.value,
      date: existingRow?.dataset.date || new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date())
    };
    const updatedRow = makeUserRow(user);
    if (existingRow) {
      existingRow.replaceWith(updatedRow);
      returnFocusTarget = updatedRow.querySelector('[data-edit-user]');
    } else {
      userRows.prepend(updatedRow);
    }
    const usersPersisted = saveUsers();
    addRecentActivity(existingRow ? `Updated demo user ${user.name}` : `Added demo user ${user.name}`);
    currentPage = 1;
    userSearch.value = '';
    renderRows();
    feedback.textContent = `${existingRow ? `${user.name}'s details were updated.` : `${user.name} was added to the workspace.`}${usersPersisted ? '' : ' Changes are only available for this visit because browser storage could not save them.'}`;
    dialog.close();
  });

  userRows.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    const row = button?.closest('tr[data-email]');
    if (!row) return;
    if (button.matches('[data-edit-user]')) {
      openUserDialog('edit', row, button);
    } else if (button.matches('[data-delete-user]')) {
      if (!window.confirm(`Delete ${row.dataset.name} from the workspace?`)) return;
      const deletedName = row.dataset.name;
      row.remove();
      const usersPersisted = saveUsers();
      addRecentActivity(`Deleted demo user ${deletedName}`);
      renderRows();
      feedback.textContent = `${deletedName} was deleted from the workspace.${usersPersisted ? '' : ' The change could not be saved to browser storage.'}`;
      userSearch.focus();
    }
  });

  userSearch.addEventListener('input', () => {
    currentPage = 1;
    feedback.textContent = '';
    renderRows();
  });
  document.querySelector('[data-page-previous]').addEventListener('click', () => {
    currentPage -= 1;
    renderRows();
  });
  document.querySelector('[data-page-next]').addEventListener('click', () => {
    currentPage += 1;
    renderRows();
  });

  const query = new URLSearchParams(window.location.search).get('q');
  if (query) userSearch.value = query;
  renderRows();
}

const reportFilter = document.querySelector('[data-report-filter]');
if (reportFilter) {
  const feedback = document.querySelector('[data-report-feedback]');
  const reportRows = Array.from(document.querySelectorAll('[data-report-table] tbody tr'));
  reportFilter.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!reportFilter.reportValidity()) return;
    const start = reportFilter.elements.start.value;
    const end = reportFilter.elements.end.value;
    if (start > end) {
      feedback.textContent = 'The start date must be on or before the end date.';
      reportFilter.elements.start.focus();
      return;
    }
    let visibleCount = 0;
    reportRows.forEach((row) => {
      row.hidden = row.dataset.date < start || row.dataset.date > end;
      if (!row.hidden) visibleCount += 1;
    });
    feedback.textContent = `Showing ${visibleCount} report ${visibleCount === 1 ? 'day' : 'days'} for the selected date range.`;
  });

  document.querySelector('[data-export-report]').addEventListener('click', () => {
    const visibleRows = reportRows.filter((row) => !row.hidden);
    const table = document.querySelector('[data-report-table]');
    const csvRows = Array.from(table.querySelectorAll('thead tr, tbody tr')).filter((row) => !row.hidden);
    const csv = csvRows.map((row) => Array.from(row.cells).map((cell) => `"${cell.textContent.trim().replaceAll('"', '""')}"`).join(',')).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const download = document.createElement('a');
    download.href = URL.createObjectURL(blob);
    const downloadUrl = download.href;
    download.download = `northstar-revenue-report-${visibleRows.length}-days.csv`;
    download.click();
    window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
    feedback.textContent = `Exported ${visibleRows.length} report ${visibleRows.length === 1 ? 'day' : 'days'} as CSV.`;
    addRecentActivity('Exported the sample revenue report');
  });
}

const settingsForm = document.querySelector('[data-settings-form]');
if (settingsForm) {
  const savedPreferences = storage.get('northstar-preferences');
  if (savedPreferences) {
    try {
      const preferences = JSON.parse(savedPreferences);
      ['name', 'email', 'title', 'timezone'].forEach((name) => {
        const input = settingsForm.elements.namedItem(name);
        if (input && preferences[name]) input.value = preferences[name];
      });
      settingsForm.querySelectorAll('input[name="notifications"]').forEach((input) => {
        input.checked = preferences.notifications?.includes(input.value) ?? input.checked;
      });
    } catch {
      storage.set('northstar-preferences', '');
    }
  }

  settingsForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!settingsForm.reportValidity()) return;
    const data = new FormData(settingsForm);
    const preferences = {
      name: data.get('name'),
      email: data.get('email'),
      title: data.get('title'),
      timezone: data.get('timezone'),
      notifications: data.getAll('notifications')
    };
    const saved = storage.set('northstar-preferences', JSON.stringify(preferences));
    addRecentActivity('Saved browser-local account preferences');
    document.querySelector('#settings-feedback').textContent = saved
      ? 'Settings saved in this browser.'
      : 'Settings are updated for this visit, but browser storage is unavailable.';
  });
}
}