import test from 'node:test';
import assert from 'node:assert/strict';

globalThis.window = {
  setTimeout: globalThis.setTimeout.bind(globalThis),
  clearTimeout: globalThis.clearTimeout.bind(globalThis)
};

const products = [
  { id: 1, title: 'Test item', price: 9.5, description: 'A valid product', category: 'test', image: 'https://example.test/item.png', rating: { rate: 4, count: 8 } }
];
const { ApiError, fetchCategories, fetchProductById, fetchProducts, fetchProductsByCategory } = await import(`../../client/js/api.js?test=${Date.now()}`);

const jsonResponse = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { 'Content-Type': 'application/json' }
});

test('valid products and categories load, while repeated full fetches use cache', async () => {
  const calls = [];
  globalThis.fetch = async (url) => {
    calls.push(url);
    if (url.endsWith('/products/categories')) return jsonResponse(['test']);
    if (url.endsWith('/products/category/test')) return jsonResponse(products);
    if (url.endsWith('/products/1')) return jsonResponse(products[0]);
    return jsonResponse(products);
  };

  assert.deepEqual(await fetchProducts(), products);
  assert.deepEqual(await fetchProducts(), products);
  assert.deepEqual(await fetchCategories(), ['test']);
  assert.deepEqual(await fetchProductsByCategory('test'), products);
  assert.deepEqual(await fetchProductById(1), products[0]);
  assert.equal(calls.filter((url) => url.endsWith('/products')).length, 1);
  assert.ok(calls.some((url) => url.endsWith('/products/category/test')));
});

test('HTTP and network errors become user-safe ApiError instances', async () => {
  globalThis.fetch = async () => jsonResponse({ message: 'upstream detail' }, 503);
  await assert.rejects(fetchProducts({ force: true }), (error) => error instanceof ApiError && error.status === 503);

  globalThis.fetch = async () => { throw new TypeError('private network detail'); };
  await assert.rejects(fetchCategories({ force: true }), (error) => error instanceof ApiError && error.status === 0 && !error.message.includes('private'));
});

test('unexpected payloads and invalid identifiers are rejected', async () => {
  globalThis.fetch = async () => jsonResponse([{ ...products[0], price: 'free' }]);
  await assert.rejects(fetchProducts({ force: true }), (error) => error instanceof ApiError && error.message.includes('unexpected format'));
  await assert.rejects(fetchProductById('bad'), TypeError);
  await assert.rejects(fetchProductsByCategory(''), TypeError);
});
