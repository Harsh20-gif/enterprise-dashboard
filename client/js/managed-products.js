import { addRecentActivity, readManagedProducts, writeManagedProducts } from './storage.js';

const makeId = () => `local-${globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`}`;
const announceManagedProducts = () => {
  if (typeof document !== 'undefined') {
    document.dispatchEvent(new CustomEvent('northstar:managed-products-change'));
  }
};

const normalizeInput = (input) => {
  const title = typeof input.title === 'string' ? input.title.trim() : '';
  const description = typeof input.description === 'string' ? input.description.trim() : '';
  const category = typeof input.category === 'string' ? input.category.trim() : '';
  const image = typeof input.image === 'string' ? input.image.trim() : '';
  const price = Number(input.price);
  if (title.length < 2 || title.length > 120) throw new TypeError('Product title must be between 2 and 120 characters.');
  if (description.length < 5 || description.length > 1200) throw new TypeError('Product description must be between 5 and 1200 characters.');
  if (category.length < 2 || category.length > 60) throw new TypeError('Category must be between 2 and 60 characters.');
  if (!Number.isFinite(price) || price < 0 || price > 1000000) throw new TypeError('Enter a valid product price.');
  try {
    if (!['http:', 'https:'].includes(new URL(image).protocol)) throw new Error('scheme');
  } catch {
    throw new TypeError('Enter a valid image URL beginning with http:// or https://.');
  }
  return { title, description, category, price, image };
};

export const listManagedProducts = () => readManagedProducts();

export const createManagedProduct = (input) => {
  const record = {
    ...normalizeInput(input),
    id: makeId(),
    rating: { rate: 0, count: 0 },
    source: 'local',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  const records = [record, ...readManagedProducts()];
  if (!writeManagedProducts(records)) throw new Error('This browser could not save the product. Check available storage and try again.');
  addRecentActivity(`Added local product ${record.title}`);
  announceManagedProducts();
  return record;
};

export const updateManagedProduct = (id, input) => {
  const records = readManagedProducts();
  const index = records.findIndex((record) => record.id === id);
  if (index < 0) throw new Error('This local product no longer exists. Refresh the page and try again.');
  const updated = {
    ...records[index],
    ...normalizeInput(input),
    updatedAt: new Date().toISOString()
  };
  records[index] = updated;
  if (!writeManagedProducts(records)) throw new Error('This browser could not save the changes. Check available storage and try again.');
  addRecentActivity(`Updated local product ${updated.title}`);
  announceManagedProducts();
  return updated;
};

export const deleteManagedProduct = (id) => {
  const records = readManagedProducts();
  const removed = records.find((record) => record.id === id);
  if (!removed) return false;
  if (!writeManagedProducts(records.filter((record) => record.id !== id))) {
    throw new Error('This browser could not save the deletion. Check available storage and try again.');
  }
  addRecentActivity(`Deleted local product ${removed.title}`);
  announceManagedProducts();
  return true;
};