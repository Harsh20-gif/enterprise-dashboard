import { createManagedProduct, deleteManagedProduct, listManagedProducts, updateManagedProduct } from './managed-products.js';
import { removeFromCart } from './cart.js';

if (document.documentElement.dataset.authenticated === 'true') {
const rows = document.querySelector('[data-managed-rows]');
const dialog = document.querySelector('[data-managed-dialog]');
const form = document.querySelector('[data-managed-form]');
const feedback = document.querySelector('[data-managed-feedback]');
const dialogFeedback = document.querySelector('[data-managed-dialog-feedback]');
const search = document.querySelector('#managed-search');
const categoryFilter = document.querySelector('#managed-category-filter');
const sort = document.querySelector('#managed-sort');
let products = listManagedProducts();
let invokingControl;

const textElement = (tag, className, text) => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = text;
  return element;
};

const filteredProducts = () => {
  const query = search.value.trim().toLocaleLowerCase();
  const results = products.filter((product) => (categoryFilter.value === 'all' || product.category === categoryFilter.value)
    && `${product.title} ${product.description} ${product.category}`.toLocaleLowerCase().includes(query));
  if (sort.value === 'price-asc') return [...results].sort((a, b) => a.price - b.price);
  if (sort.value === 'price-desc') return [...results].sort((a, b) => b.price - a.price);
  if (sort.value === 'name-desc') return [...results].sort((a, b) => b.title.localeCompare(a.title));
  return [...results].sort((a, b) => a.title.localeCompare(b.title));
};

const makeAction = (label, action, id, danger = false) => {
  const button = textElement('button', danger ? 'text-button text-danger' : 'text-button', label);
  button.type = 'button';
  button.dataset.managedAction = action;
  button.dataset.productId = id;
  button.setAttribute('aria-label', `${label} ${products.find((product) => product.id === id)?.title || 'product'}`);
  return button;
};

const render = () => {
  rows.replaceChildren();
  const selectedCategory = categoryFilter.value;
  const categories = [...new Set(products.map((product) => product.category))].sort((a, b) => a.localeCompare(b));
  categoryFilter.replaceChildren(new Option('All categories', 'all'));
  categories.forEach((category) => categoryFilter.add(new Option(category, category)));
  categoryFilter.value = categories.includes(selectedCategory) ? selectedCategory : 'all';
  const visible = filteredProducts();
  document.querySelector('[data-managed-count]').textContent = String(products.length);
  if (!visible.length) {
    const row = document.createElement('tr');
    const cell = textElement('td', '', products.length ? 'No local products match this search.' : 'No local products yet. Add one to begin managing browser-local records.');
    cell.colSpan = 5;
    row.append(cell);
    rows.append(row);
    return;
  }
  visible.forEach((product) => {
    const row = document.createElement('tr');
    const productCell = document.createElement('td');
    const summary = document.createElement('span');
    summary.className = 'table-person';
    const image = document.createElement('img');
    image.className = 'managed-thumb';
    image.src = product.image;
    image.alt = '';
    image.loading = 'lazy';
    image.addEventListener('error', () => {
      image.removeAttribute('src');
      image.alt = `${product.title} image unavailable`;
    }, { once: true });
    const title = document.createElement('span');
    title.append(textElement('strong', '', product.title), textElement('small', '', product.id));
    summary.append(image, title);
    productCell.append(summary);
    const category = textElement('td', '', product.category);
    const price = textElement('td', '', new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(product.price));
    const source = textElement('td', '', 'Local demo');
    const actions = document.createElement('td');
    actions.className = 'action-cell';
    actions.append(makeAction('View', 'view', product.id), makeAction('Edit', 'edit', product.id), makeAction('Delete', 'delete', product.id, true));
    row.append(productCell, category, price, source, actions);
    rows.append(row);
  });
};

const openForm = (mode, product = null, invoker) => {
  invokingControl = invoker;
  form.reset();
  form.querySelectorAll('[aria-invalid="true"]').forEach((control) => control.removeAttribute('aria-invalid'));
  form.querySelectorAll('.field-error').forEach((error) => { error.textContent = ''; });
  dialogFeedback.textContent = '';
  const editing = mode === 'edit';
  document.querySelector('#managed-dialog-title').textContent = editing ? 'Edit local product' : 'Add local product';
  document.querySelector('#managed-id').value = product?.id || '';
  ['title', 'category', 'price', 'image', 'description'].forEach((name) => {
    form.elements.namedItem(name).value = product?.[name] ?? '';
  });
  dialog.showModal();
  document.querySelector('#managed-title').focus();
};

document.querySelector('[data-add-managed-product]').addEventListener('click', (event) => openForm('add', null, event.currentTarget));
document.querySelectorAll('[data-close-managed], [data-cancel-managed]').forEach((button) => button.addEventListener('click', () => dialog.close()));
dialog.addEventListener('close', () => { if (invokingControl?.isConnected) invokingControl.focus(); });
dialog.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    event.preventDefault();
    dialog.close();
  }
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const product = Object.fromEntries(['title', 'description', 'category', 'price', 'image'].map((name) => [name, data.get(name)]));
  try {
    const id = data.get('id');
    const saved = id ? updateManagedProduct(id, product) : createManagedProduct(product);
    products = listManagedProducts();
    render();
    feedback.textContent = `${saved.title} ${id ? 'updated' : 'added'} as a local demo product.`;
    dialog.close();
  } catch (error) {
    dialogFeedback.textContent = error instanceof Error ? error.message : 'The product could not be saved.';
  }
});

rows.addEventListener('click', (event) => {
  const button = event.target.closest('[data-managed-action]');
  if (!button) return;
  const product = products.find((item) => item.id === button.dataset.productId);
  if (!product) return;
  if (button.dataset.managedAction === 'edit') {
    openForm('edit', product, button);
  } else if (button.dataset.managedAction === 'view') {
    const detail = document.querySelector('[data-product-detail-dialog]');
    document.querySelector('#product-detail-title').textContent = product.title;
    document.querySelector('[data-product-detail-description]').textContent = product.description;
    document.querySelector('[data-product-detail-category]').textContent = product.category;
    document.querySelector('[data-product-detail-price]').textContent = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(product.price);
    invokingControl = button;
    detail.showModal();
  } else if (button.dataset.managedAction === 'delete' && window.confirm(`Delete local product “${product.title}”?`)) {
    try {
      deleteManagedProduct(product.id);
      removeFromCart(product.id);
      products = listManagedProducts();
      render();
      feedback.textContent = `${product.title} was removed from local products.`;
      search.focus();
    } catch (error) {
      feedback.textContent = error instanceof Error ? error.message : 'The product could not be deleted.';
    }
  }
});

const detailDialog = document.querySelector('[data-product-detail-dialog]');
detailDialog.querySelector('[data-close-detail]').addEventListener('click', () => detailDialog.close());
detailDialog.addEventListener('close', () => { if (invokingControl?.isConnected) invokingControl.focus(); });
search.addEventListener('input', render);
sort.addEventListener('change', render);
categoryFilter.addEventListener('change', render);
render();
}