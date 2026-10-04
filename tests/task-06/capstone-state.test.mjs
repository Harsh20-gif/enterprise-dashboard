import test from 'node:test';
import assert from 'node:assert/strict';

const values = new Map();
globalThis.localStorage = {
  getItem: (key) => values.get(key) ?? null,
  setItem: (key, value) => values.set(key, String(value)),
  removeItem: (key) => values.delete(key)
};

const storage = await import(`../../client/js/storage.js?capstone=${Date.now()}`);
const managed = await import(`../../client/js/managed-products.js?capstone=${Date.now()}`);
const cart = await import(`../../client/js/cart.js?capstone=${Date.now()}`);

const productInput = {
  title: 'Demo desk lamp',
  description: 'Locally managed lighting record.',
  category: 'Home',
  price: '32.40',
  image: 'https://images.example.test/lamp.jpg'
};

test('demo users validate and persist in this browser store', () => {
  values.clear();
  const users = [
    { id: 'demo-one', name: 'Taylor Example', email: 'taylor@example.test', role: 'Editor', status: 'Active', date: 'Oct 4, 2026' },
    { id: 'bad', name: 'No email', email: 'invalid', role: 'Editor', status: 'Active', date: 'Today' }
  ];
  storage.writeDemoUsers(users);
  assert.deepEqual(storage.readDemoUsers(), [users[0]]);
});

test('managed product CRUD persists and string IDs work in the cart', () => {
  values.clear();
  const created = managed.createManagedProduct(productInput);
  assert.match(created.id, /^local-/);
  assert.equal(storage.readManagedProducts().length, 1);
  const updated = managed.updateManagedProduct(created.id, { ...productInput, title: 'Updated desk lamp' });
  assert.equal(updated.title, 'Updated desk lamp');

  const summary = cart.addToCart(updated);
  assert.equal(summary.quantity, 1);
  assert.equal(summary.subtotal, 32.4);
  assert.equal(storage.readCartStorage()[0].id, created.id);
  cart.setCartQuantity(created.id, 2);
  assert.equal(cart.getCartSummary().subtotal, 64.8);
  cart.removeFromCart(created.id);
  assert.equal(cart.getCartSummary().quantity, 0);

  assert.equal(managed.deleteManagedProduct(created.id), true);
  assert.deepEqual(storage.readManagedProducts(), []);
});

test('invalid CRUD fields are rejected before storage updates', () => {
  values.clear();
  assert.throws(() => managed.createManagedProduct({ ...productInput, price: '-3' }), /valid product price/);
  assert.throws(() => managed.createManagedProduct({ ...productInput, image: 'javascript:alert(1)' }), /valid image URL/);
  assert.deepEqual(storage.readManagedProducts(), []);
});
