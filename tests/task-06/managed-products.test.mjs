import test from 'node:test';
import assert from 'node:assert/strict';

const values = new Map();
globalThis.localStorage = {
  getItem: (key) => values.get(key) ?? null,
  setItem: (key, value) => values.set(key, String(value)),
  removeItem: (key) => values.delete(key)
};
const { createManagedProduct, deleteManagedProduct, listManagedProducts, updateManagedProduct } = await import(`../../client/js/managed-products.js?test=${Date.now()}`);

const validProduct = {
  title: 'Capstone mug',
  description: 'A locally managed demo mug.',
  category: 'Demo goods',
  price: '14.50',
  image: 'https://example.test/mug.jpg'
};

test('local product create, view, update, delete, and reload persistence', () => {
  values.clear();
  const created = createManagedProduct(validProduct);
  assert.match(created.id, /^local-/);
  assert.equal(listManagedProducts()[0].title, validProduct.title);

  const updated = updateManagedProduct(created.id, { ...validProduct, title: 'Updated mug', price: '12' });
  assert.equal(updated.title, 'Updated mug');
  assert.equal(listManagedProducts()[0].price, 12);

  assert.equal(deleteManagedProduct(created.id), true);
  assert.deepEqual(listManagedProducts(), []);
  assert.equal(deleteManagedProduct(created.id), false);
});

test('local product validation rejects invalid prices and URLs', () => {
  assert.throws(() => createManagedProduct({ ...validProduct, price: '-1' }), /valid product price/);
  assert.throws(() => createManagedProduct({ ...validProduct, image: 'javascript:alert(1)' }), /valid image URL/);
});
