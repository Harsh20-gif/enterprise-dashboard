const API_BASE_URL = 'https://fakestoreapi.com';

export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

let productsCache;
let productsRequest;
let categoriesCache;
let categoriesRequest;

const requestJson = async (path) => {
  let response;
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 12000);
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { Accept: 'application/json' },
      signal: controller.signal
    });
  } catch (error) {
    console.error('FakeStoreAPI request failed:', error instanceof Error ? error.name : 'UnknownError');
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('The product service is taking too long to respond. Check your connection and retry.');
    }
    throw new ApiError('The product service could not be reached. Check your connection and try again.');
  } finally {
    window.clearTimeout(timeoutId);
  }

  if (!response.ok) {
    throw new ApiError(`The product service returned an error (${response.status}). Try again shortly.`, response.status);
  }

  try {
    return await response.json();
  } catch {
    throw new ApiError('The product service returned an unreadable response. Please try again.');
  }
};

const isProduct = (value) => value !== null
  && typeof value === 'object'
  && Number.isInteger(value.id)
  && typeof value.title === 'string'
  && value.title.length > 0
  && typeof value.description === 'string'
  && typeof value.category === 'string'
  && Number.isFinite(value.price)
  && value.price >= 0
  && typeof value.image === 'string'
  && (() => {
    try {
      return ['http:', 'https:'].includes(new URL(value.image).protocol);
    } catch {
      return false;
    }
  })()
  && Number.isFinite(value.rating?.rate)
  && Number.isFinite(value.rating?.count);

const validateProducts = (payload) => {
  if (!Array.isArray(payload) || !payload.every(isProduct)) {
    throw new ApiError('The product service returned data in an unexpected format. Please retry.');
  }
  return payload;
};

export const fetchProducts = async ({ force = false } = {}) => {
  if (force) {
    productsCache = undefined;
    productsRequest = undefined;
  }
  if (productsCache) return productsCache;
  if (!productsRequest) {
    productsRequest = requestJson('/products')
      .then(validateProducts)
      .then((products) => {
        productsCache = products;
        return products;
      })
      .finally(() => {
        productsRequest = undefined;
      });
  }
  return productsRequest;
};

export const fetchCategories = async ({ force = false } = {}) => {
  if (force) {
    categoriesCache = undefined;
    categoriesRequest = undefined;
  }
  if (categoriesCache) return categoriesCache;
  if (!categoriesRequest) {
    categoriesRequest = requestJson('/products/categories')
      .then((categories) => {
        if (!Array.isArray(categories) || !categories.every((category) => typeof category === 'string' && category.length > 0)) {
          throw new ApiError('The category service returned data in an unexpected format.');
        }
        categoriesCache = categories;
        return categories;
      })
      .finally(() => {
        categoriesRequest = undefined;
      });
  }
  return categoriesRequest;
};

export const fetchProductsByCategory = async (category) => {
  if (typeof category !== 'string' || category.trim() === '') {
    throw new TypeError('A product category is required.');
  }
  const encodedCategory = encodeURIComponent(category.trim());
  return validateProducts(await requestJson(`/products/category/${encodedCategory}`));
};

export const fetchProductById = async (id) => {
  const productId = Number(id);
  if (!Number.isInteger(productId) || productId < 1) {
    throw new TypeError('A valid product ID is required.');
  }
  const product = await requestJson(`/products/${productId}`);
  if (!isProduct(product)) {
    throw new ApiError('The product service returned data in an unexpected format.');
  }
  return product;
};