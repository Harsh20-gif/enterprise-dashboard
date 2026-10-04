const STORAGE_KEYS = Object.freeze({
  cart: 'northstar-cart',
  preferences: 'northstar-product-preferences',
  users: 'northstar-demo-users',
  managedProducts: 'northstar-managed-products',
  activity: 'northstar-demo-activity'
});

const readJson = (key, fallback) => {
  try {
    const stored = localStorage.getItem(key);
    return stored === null ? fallback : JSON.parse(stored);
  } catch (error) {
    console.warn(`Unable to read saved ${key} data:`, error instanceof Error ? error.message : 'Storage error');
    return fallback;
  }
};

const writeJson = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`Unable to save ${key} data:`, error instanceof Error ? error.message : 'Storage error');
    return false;
  }
};

export const readCartStorage = () => {
  const value = readJson(STORAGE_KEYS.cart, []);
  if (!Array.isArray(value)) return [];
  return value.filter((item) => item && (Number.isInteger(item.id) && item.id > 0 || typeof item.id === 'string' && item.id.startsWith('local-'))
    && typeof item.title === 'string'
    && Number.isFinite(item.price) && item.price >= 0
    && typeof item.image === 'string'
    && typeof item.category === 'string'
    && Number.isInteger(item.quantity) && item.quantity > 0);
};

export const writeCartStorage = (cart) => writeJson(STORAGE_KEYS.cart, cart);

export const readProductPreferences = () => {
  const value = readJson(STORAGE_KEYS.preferences, {});
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return {
    category: typeof value.category === 'string' ? value.category : 'all',
    sort: ['default', 'price-asc', 'price-desc', 'name-asc', 'name-desc'].includes(value.sort)
      ? value.sort
      : 'default'
  };
};

export const writeProductPreferences = (preferences) => writeJson(STORAGE_KEYS.preferences, {
  category: typeof preferences.category === 'string' ? preferences.category : 'all',
  sort: ['default', 'price-asc', 'price-desc', 'name-asc', 'name-desc'].includes(preferences.sort)
    ? preferences.sort
    : 'default'
});

export const readDemoUsers = () => {
  const value = readJson(STORAGE_KEYS.users, []);
  if (!Array.isArray(value)) return [];
  return value.filter((user) => user && typeof user.id === 'string'
    && typeof user.name === 'string' && user.name.trim().length >= 2
    && typeof user.email === 'string' && user.email.includes('@')
    && typeof user.role === 'string'
    && ['Active', 'Inactive', 'Pending invitation'].includes(user.status)
    && typeof user.date === 'string');
};

export const writeDemoUsers = (users) => writeJson(STORAGE_KEYS.users, users.filter((user) => user
  && typeof user.id === 'string'
  && typeof user.name === 'string' && user.name.trim().length >= 2
  && typeof user.email === 'string' && user.email.includes('@')
  && typeof user.role === 'string'
  && ['Active', 'Inactive', 'Pending invitation'].includes(user.status)
  && typeof user.date === 'string'));

export const ensureDemoUsers = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.users);
    if (stored !== null) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return readDemoUsers();
      } catch {
        console.warn('Invalid saved demo-user data was replaced with the documented demo records.');
      }
    }
  } catch {
    return [];
  }
  const initialUsers = [
    ['Jordan Lee', 'jordan.lee@example.com', 'Product Designer', 'Active', 'Oct 5, 2026'],
    ['Sarah Kim', 'sarah.kim@example.com', 'Engineering', 'Active', 'Oct 4, 2026'],
    ['Marcus Chen', 'marcus.chen@example.com', 'Marketing', 'Pending invitation', 'Oct 3, 2026'],
    ['Amara Patel', 'amara.patel@example.com', 'Administrator', 'Active', 'Oct 2, 2026'],
    ['Daniel Wright', 'daniel.wright@example.com', 'Customer Success', 'Inactive', 'Oct 1, 2026']
  ].map(([name, email, role, status, date]) => ({ id: `demo-${email}`, name, email, role, status, date }));
  writeDemoUsers(initialUsers);
  return initialUsers;
};

export const readManagedProducts = () => {
  const value = readJson(STORAGE_KEYS.managedProducts, []);
  if (!Array.isArray(value)) return [];
  return value.filter((product) => product && typeof product.id === 'string' && product.id.startsWith('local-')
    && typeof product.title === 'string' && product.title.trim().length >= 2
    && typeof product.description === 'string'
    && typeof product.category === 'string' && product.category.trim().length > 0
    && Number.isFinite(product.price) && product.price >= 0
    && typeof product.image === 'string'
    && Number.isFinite(product.rating?.rate) && Number.isFinite(product.rating?.count));
};

export const writeManagedProducts = (products) => writeJson(STORAGE_KEYS.managedProducts, products.filter((product) => product
  && typeof product.id === 'string' && product.id.startsWith('local-')
  && typeof product.title === 'string' && product.title.trim().length >= 2
  && typeof product.description === 'string'
  && typeof product.category === 'string' && product.category.trim().length > 0
  && Number.isFinite(product.price) && product.price >= 0
  && typeof product.image === 'string'
  && Number.isFinite(product.rating?.rate) && Number.isFinite(product.rating?.count)));

export const readRecentActivity = () => {
  const value = readJson(STORAGE_KEYS.activity, []);
  if (!Array.isArray(value)) return [];
  return value.filter((entry) => entry && typeof entry.id === 'string'
    && typeof entry.message === 'string' && typeof entry.at === 'string').slice(0, 12);
};

export const addRecentActivity = (message) => {
  if (typeof message !== 'string' || !message.trim()) return readRecentActivity();
  const entries = [{ id: globalThis.crypto?.randomUUID?.() || `${Date.now()}`, message: message.trim(), at: new Date().toISOString() }, ...readRecentActivity()].slice(0, 12);
  writeJson(STORAGE_KEYS.activity, entries);
  if (typeof document !== 'undefined') {
    document.dispatchEvent(new CustomEvent('northstar:activity-change', { detail: entries }));
  }
  return entries;
};