import test from 'node:test';
import assert from 'node:assert/strict';

const values = new Map();
globalThis.localStorage = {
  getItem: (key) => values.get(key) ?? null,
  setItem: (key, value) => values.set(key, String(value)),
  removeItem: (key) => values.delete(key)
};
globalThis.CustomEvent = class CustomEvent extends Event {
  constructor(type, options = {}) {
    super(type);
    this.detail = options.detail;
  }
};

const { readCartStorage, readProductPreferences, writeProductPreferences } = await import('../../client/js/storage.js');
const cart = await import('../../client/js/cart.js');

test('cart adds once, increments duplicates, computes totals, and persists updates', () => {
  values.clear();
  const product = { id: 42, title: 'Live item', price: 12.5, image: 'https://example.test/item.png', category: 'test' };
  cart.addToCart(product);
  let summary = cart.addToCart(product);
  assert.equal(summary.quantity, 2);
  assert.equal(summary.subtotal, 25);
  assert.equal(readCartStorage()[0].quantity, 2);

  summary = cart.setCartQuantity(42, 3);
  assert.equal(summary.quantity, 3);
  assert.equal(summary.subtotal, 37.5);
  assert.equal(readCartStorage()[0].quantity, 3);

  summary = cart.setCartQuantity(42, 2);
  assert.equal(summary.quantity, 2);
  summary = cart.removeFromCart(42);
  assert.equal(summary.quantity, 0);
  assert.deepEqual(readCartStorage(), []);
});

test('invalid cart and preference storage are safely normalized', () => {
  values.clear();
  values.set('northstar-cart', '{bad');
  values.set('northstar-product-preferences', JSON.stringify({ category: 4, sort: 'unsupported' }));
  assert.deepEqual(readCartStorage(), []);
  assert.deepEqual(readProductPreferences(), { category: 'all', sort: 'default' });
  writeProductPreferences({ category: 'jewelery', sort: 'price-asc' });
  assert.deepEqual(readProductPreferences(), { category: 'jewelery', sort: 'price-asc' });
});