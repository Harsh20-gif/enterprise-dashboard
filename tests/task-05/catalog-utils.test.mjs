import test from 'node:test';
import assert from 'node:assert/strict';
import { filterAndSortProducts } from '../../client/js/catalog-utils.js';

const products = [
  { id: 1, title: 'Silver Ring', description: 'A sterling band', category: 'jewelery', price: 25 },
  { id: 2, title: 'Blue Shirt', description: 'Cotton clothing', category: "men's clothing", price: 10 },
  { id: 3, title: 'Gold Ring', description: 'A polished band', category: 'jewelery', price: 40 }
];

test('default order and case-insensitive title/detail search', () => {
  assert.deepEqual(filterAndSortProducts(products).map((product) => product.id), [1, 2, 3]);
  assert.deepEqual(filterAndSortProducts(products, { query: 'COTTON' }).map((product) => product.id), [2]);
  assert.deepEqual(filterAndSortProducts(products, { query: 'RING' }).map((product) => product.id), [1, 3]);
});

test('search combines with category and supports an empty result', () => {
  assert.deepEqual(filterAndSortProducts(products, { query: 'gold', category: 'jewelery' }).map((product) => product.id), [3]);
  assert.deepEqual(filterAndSortProducts(products, { query: 'gold', category: "men's clothing" }), []);
});

test('all requested sorts are applied without reordering the source array', () => {
  assert.deepEqual(filterAndSortProducts(products, { sort: 'price-asc' }).map((product) => product.id), [2, 1, 3]);
  assert.deepEqual(filterAndSortProducts(products, { sort: 'price-desc' }).map((product) => product.id), [3, 1, 2]);
  assert.deepEqual(filterAndSortProducts(products, { sort: 'name-asc' }).map((product) => product.id), [2, 3, 1]);
  assert.deepEqual(filterAndSortProducts(products, { sort: 'name-desc' }).map((product) => product.id), [1, 3, 2]);
  assert.deepEqual(products.map((product) => product.id), [1, 2, 3]);
});