import { ApiError, fetchCategories, fetchProducts } from './api.js';
import { addToCart, getCartSummary, removeFromCart, setCartQuantity } from './cart.js';
import { filterAndSortProducts } from './catalog-utils.js';
import { readProductPreferences, writeProductPreferences } from './storage.js';

const productGrid = document.querySelector('[data-product-grid]');
const categoryList = document.querySelector('[data-category-list]');
const searchInput = document.querySelector('#catalog-search');
const clearSearchButton = document.querySelector('[data-clear-search]');
const sortSelect = document.querySelector('#product-sort');
const countLabel = document.querySelector('[data-product-count]');
const feedback = document.querySelector('[data-catalog-feedback]');
const errorBanner = document.querySelector('[data-catalog-error]');
const errorMessage = document.querySelector('[data-catalog-error-message]');
const retryButton = document.querySelector('[data-retry-products]');
const cartItems = document.querySelector('[data-cart-items]');
const cartCount = document.querySelector('[data-cart-count]');
const cartQuantity = document.querySelector('[data-cart-quantity]');
const cartSubtotal = document.querySelector('[data-cart-subtotal]');
const cartFeedback = document.querySelector('[data-cart-feedback]');

const preferences = readProductPreferences();
let products = [];
let categories = [];
let selectedCategory = preferences.category;
let categoryWarning = '';
let announcementTimer;

sortSelect.value = preferences.sort;

const formatPrice = (price) => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
}).format(price);

const makeElement = (tagName, className, text) => {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
};

const matchingProducts = () => filterAndSortProducts(products, {
  query: searchInput.value,
  category: selectedCategory,
  sort: sortSelect.value
});

const createProductCard = (product) => {
  const card = makeElement('article', 'product-card');
  const imageFrame = makeElement('div', 'product-image-frame');
  const image = makeElement('img', 'product-image');
  image.src = product.image;
  image.alt = product.title;
  image.loading = 'lazy';
  image.decoding = 'async';
  image.addEventListener('error', () => {
    image.removeAttribute('src');
    image.alt = `${product.title} image unavailable`;
    imageFrame.classList.add('image-unavailable');
    imageFrame.append(makeElement('span', 'image-fallback', 'Image unavailable'));
  }, { once: true });
  imageFrame.append(image);

  const details = makeElement('div', 'product-details');
  details.append(makeElement('p', 'product-category', product.category));
  details.append(makeElement('h2', 'product-title', product.title));
  const rating = makeElement('p', 'product-rating');
  rating.append(makeElement('span', 'rating-value', `${product.rating.rate.toFixed(1)} / 5`));
  rating.append(makeElement('span', 'rating-count', `${product.rating.count} ratings`));
  details.append(rating);

  const footer = makeElement('footer', 'product-card-footer');
  footer.append(makeElement('strong', 'product-price', formatPrice(product.price)));
  const addButton = makeElement('button', 'button button-primary product-add', 'Add to cart');
  addButton.type = 'button';
  addButton.dataset.addProduct = String(product.id);
  addButton.setAttribute('aria-label', `Add ${product.title} to cart`);
  footer.append(addButton);
  card.append(imageFrame, details, footer);
  return card;
};

const renderProducts = () => {
  const visibleProducts = matchingProducts();
  productGrid.replaceChildren();
  productGrid.setAttribute('aria-busy', 'false');
  countLabel.textContent = `${visibleProducts.length} ${visibleProducts.length === 1 ? 'product' : 'products'}`;
  const resultMessage = visibleProducts.length
    ? `Showing ${visibleProducts.length} ${visibleProducts.length === 1 ? 'product' : 'products'}.`
    : 'No products match your search and category. Try changing or clearing your filters.';
  feedback.textContent = categoryWarning ? `${categoryWarning} ${resultMessage}` : resultMessage;

  if (visibleProducts.length === 0) {
    const empty = makeElement('div', 'catalog-empty');
    empty.append(makeElement('h2', '', 'No products found'));
    empty.append(makeElement('p', 'muted', 'Try a different search term or choose another category.'));
    productGrid.append(empty);
    return;
  }
  productGrid.append(...visibleProducts.map(createProductCard));
};

const renderCategories = () => {
  categoryList.replaceChildren();
  const choices = ['all', ...categories];
  if (!choices.includes(selectedCategory)) selectedCategory = 'all';
  choices.forEach((category) => {
    const label = category === 'all' ? 'All products' : category;
    const button = makeElement('button', 'category-button', label);
    button.type = 'button';
    button.dataset.category = category;
    button.classList.toggle('is-active', selectedCategory === category);
    button.setAttribute('aria-pressed', String(selectedCategory === category));
    categoryList.append(button);
  });
};

const renderCart = (summary = getCartSummary()) => {
  cartItems.replaceChildren();
  cartCount.textContent = String(summary.quantity);
  cartQuantity.textContent = String(summary.quantity);
  cartSubtotal.textContent = formatPrice(summary.subtotal);

  if (summary.items.length === 0) {
    cartItems.append(makeElement('p', 'cart-empty', 'Your cart is empty. Add a product to get started.'));
    return;
  }

  summary.items.forEach((item) => {
    const row = makeElement('article', 'cart-item');
    const image = makeElement('img', 'cart-item-image');
    image.src = item.image;
    image.alt = '';
    image.loading = 'lazy';
    const details = makeElement('div', 'cart-item-details');
    details.append(makeElement('h3', 'cart-item-title', item.title));
    details.append(makeElement('p', 'cart-item-price', `${formatPrice(item.price)} each`));

    const quantityControls = makeElement('div', 'cart-item-controls');
    const decrease = makeElement('button', 'quantity-button', '−');
    decrease.type = 'button';
    decrease.dataset.quantityChange = '-1';
    decrease.dataset.productId = String(item.id);
    decrease.setAttribute('aria-label', `Decrease quantity of ${item.title}`);
    const quantity = makeElement('span', 'quantity-value', String(item.quantity));
    quantity.setAttribute('aria-label', `Quantity ${item.quantity}`);
    const increase = makeElement('button', 'quantity-button', '+');
    increase.type = 'button';
    increase.dataset.quantityChange = '1';
    increase.dataset.productId = String(item.id);
    increase.setAttribute('aria-label', `Increase quantity of ${item.title}`);
    quantityControls.append(decrease, quantity, increase);

    const remove = makeElement('button', 'cart-remove', 'Remove');
    remove.type = 'button';
    remove.dataset.removeProduct = String(item.id);
    remove.setAttribute('aria-label', `Remove ${item.title} from cart`);
    details.append(quantityControls, remove);
    row.append(image, details);
    cartItems.append(row);
  });
};

const savePreferences = () => {
  writeProductPreferences({ category: selectedCategory, sort: sortSelect.value });
};

const renderError = (error) => {
  const message = error instanceof ApiError
    ? error.message
    : 'The catalog could not be loaded. Check your connection and try again.';
  console.error('Product catalog error:', error instanceof Error ? error.message : 'Unexpected error');
  errorMessage.textContent = message;
  errorBanner.hidden = false;
  productGrid.replaceChildren();
  productGrid.setAttribute('aria-busy', 'false');
  countLabel.textContent = 'Catalog unavailable';
  feedback.textContent = 'The product catalog is unavailable. Use Retry to try again.';
};

const loadCatalog = async ({ retry = false } = {}) => {
  retryButton.disabled = true;
  errorBanner.hidden = true;
  productGrid.setAttribute('aria-busy', 'true');
  feedback.textContent = 'Loading products from FakeStoreAPI.';
  countLabel.textContent = 'Loading catalog';
  productGrid.replaceChildren();
  for (let index = 0; index < 6; index += 1) {
    const skeleton = makeElement('article', 'product-card product-skeleton');
    skeleton.setAttribute('aria-hidden', 'true');
    skeleton.append(makeElement('h2', 'visually-hidden', 'Loading product'));
    skeleton.append(makeElement('span', 'skeleton-image'));
    skeleton.append(makeElement('span', 'skeleton-line skeleton-short'));
    skeleton.append(makeElement('span', 'skeleton-line'));
    skeleton.append(makeElement('span', 'skeleton-line skeleton-price'));
    productGrid.append(skeleton);
  }
  try {
    const [loadedProducts, categoryResult] = await Promise.allSettled([
      fetchProducts({ force: retry }),
      fetchCategories({ force: retry })
    ]);
    if (loadedProducts.status === 'rejected') throw loadedProducts.reason;
    products = loadedProducts.value;
    if (categoryResult.status === 'fulfilled') {
      categories = categoryResult.value;
      categoryWarning = '';
    } else {
      categories = [...new Set(products.map((product) => product.category))];
      categoryWarning = 'Categories could not be refreshed. Showing categories from the loaded product catalog.';
      console.warn('Product categories could not be loaded:', categoryResult.reason);
    }
    renderCategories();
    savePreferences();
    errorBanner.hidden = true;
    renderProducts();
  } catch (error) {
    renderError(error);
  } finally {
    retryButton.disabled = false;
  }
};

searchInput.addEventListener('input', () => {
  clearSearchButton.hidden = searchInput.value.length === 0;
  if (products.length) renderProducts();
});

clearSearchButton.addEventListener('click', () => {
  searchInput.value = '';
  clearSearchButton.hidden = true;
  renderProducts();
  searchInput.focus();
});

categoryList.addEventListener('click', (event) => {
  const button = event.target.closest('[data-category]');
  if (!button || !categories.includes(button.dataset.category) && button.dataset.category !== 'all') return;
  selectedCategory = button.dataset.category;
  categoryList.querySelectorAll('[data-category]').forEach((categoryButton) => {
    const isSelected = categoryButton === button;
    categoryButton.classList.toggle('is-active', isSelected);
    categoryButton.setAttribute('aria-pressed', String(isSelected));
  });
  savePreferences();
  renderProducts();
});

sortSelect.addEventListener('change', () => {
  savePreferences();
  if (products.length) renderProducts();
});

retryButton.addEventListener('click', () => loadCatalog({ retry: true }));

productGrid.addEventListener('click', (event) => {
  const button = event.target.closest('[data-add-product]');
  if (!button) return;
  const product = products.find((item) => item.id === Number(button.dataset.addProduct));
  if (!product) return;
  const summary = addToCart(product);
  cartFeedback.textContent = `${product.title} added to cart. Cart now has ${summary.quantity} ${summary.quantity === 1 ? 'item' : 'items'}.`;
  window.clearTimeout(announcementTimer);
  announcementTimer = window.setTimeout(() => {
    cartFeedback.textContent = '';
  }, 5000);
});

cartItems.addEventListener('click', (event) => {
  const quantityButton = event.target.closest('[data-quantity-change]');
  if (quantityButton) {
    const item = getCartSummary().items.find((cartItem) => cartItem.id === Number(quantityButton.dataset.productId));
    if (item) setCartQuantity(item.id, item.quantity + Number(quantityButton.dataset.quantityChange));
    return;
  }
  const removeButton = event.target.closest('[data-remove-product]');
  if (removeButton) removeFromCart(removeButton.dataset.removeProduct);
});

document.addEventListener('northstar:cart-change', (event) => renderCart(event.detail));

renderCart();
loadCatalog();