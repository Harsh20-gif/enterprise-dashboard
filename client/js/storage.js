const STORAGE_KEYS = Object.freeze({
  cart: 'northstar-cart',
  preferences: 'northstar-product-preferences'
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
  return value.filter((item) => item && Number.isInteger(item.id) && item.id > 0
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