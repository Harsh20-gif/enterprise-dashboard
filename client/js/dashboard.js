import { fetchProducts } from './api.js';
import { getCartSummary } from './cart.js';
import { addRecentActivity, readDemoUsers, readManagedProducts, readRecentActivity } from './storage.js';

if (document.documentElement.dataset.authenticated === 'true') {
const formatPrice = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
const usersValue = document.querySelector('[data-analytics-users]');
const apiProductsValue = document.querySelector('[data-analytics-api-products]');
const localProductsValue = document.querySelector('[data-analytics-local-products]');
const cartItemsValue = document.querySelector('[data-analytics-cart-items]');
const cartSubtotalValue = document.querySelector('[data-analytics-cart-subtotal]');
const categoryChart = document.querySelector('[data-dashboard-category-chart]');
const categoryCaption = document.querySelector('[data-dashboard-category-caption]');
const userTable = document.querySelector('[data-dashboard-users]');
const activityList = document.querySelector('[data-dashboard-activity]');

const create = (tag, className, text) => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
};

const updateUsers = () => {
  const users = readDemoUsers();
  usersValue.textContent = String(users.length);
  userTable.replaceChildren();
  if (!users.length) {
    const row = create('tr');
    const cell = create('td', '', 'No browser-local demo users yet.');
    cell.colSpan = 4;
    row.append(cell);
    userTable.append(row);
    return;
  }
  users.slice(0, 5).forEach((user) => {
    const row = document.createElement('tr');
    const identityCell = document.createElement('td');
    const person = create('span', 'table-person');
    const initials = user.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
    const avatar = create('span', 'small-avatar avatar-blue', initials);
    avatar.setAttribute('aria-hidden', 'true');
    const nameAndEmail = create('span');
    nameAndEmail.append(create('strong', '', user.name), create('small', '', user.email));
    person.append(avatar, nameAndEmail);
    identityCell.append(person);
    row.append(identityCell, create('td', '', user.role), create('td', '', user.date));
    const statusCell = document.createElement('td');
    const statusClass = user.status === 'Active' ? 'status-active' : user.status === 'Inactive' ? 'status-inactive' : 'status-pending';
    statusCell.append(create('span', `status-pill ${statusClass}`, user.status));
    row.append(statusCell);
    userTable.append(row);
  });
};

const updateCartMetrics = (summary = getCartSummary()) => {
  cartItemsValue.textContent = String(summary.quantity);
  cartSubtotalValue.textContent = `${formatPrice(summary.subtotal)} current cart subtotal; not revenue`;
};

const updateActivity = (entries = readRecentActivity()) => {
  activityList.replaceChildren();
  if (!entries.length) {
    activityList.append(create('li', '', 'No local activity recorded yet.'));
    return;
  }
  entries.slice(0, 4).forEach((entry) => {
    const item = document.createElement('li');
    const marker = create('span', 'activity-avatar avatar-blue', 'ND');
    marker.setAttribute('aria-hidden', 'true');
    const copy = document.createElement('div');
    copy.append(create('p', '', entry.message));
    const date = new Date(entry.at);
    const time = document.createElement('time');
    time.dateTime = entry.at;
    time.textContent = Number.isNaN(date.valueOf()) ? 'Saved activity' : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
    copy.append(time);
    item.append(marker, copy);
    activityList.append(item);
  });
};

const updateCategoryChart = (apiProducts, localProducts) => {
  const counts = new Map();
  [...apiProducts, ...localProducts].forEach((product) => counts.set(product.category, (counts.get(product.category) || 0) + 1));
  categoryChart.replaceChildren();
  if (!counts.size) {
    categoryChart.append(create('p', 'muted', 'No product distribution is available until catalog data loads or local products are added.'));
    categoryCaption.textContent = 'No catalog records are available; no business figures are inferred.';
    return;
  }
  const maxCount = Math.max(...counts.values());
  const chart = create('div', 'bar-chart');
  chart.setAttribute('aria-hidden', 'true');
  [...counts.entries()].sort((first, second) => second[1] - first[1]).slice(0, 6).forEach(([category, count]) => {
    const column = create('div', 'bar-column');
    const bar = create('span', 'bar');
    bar.style.setProperty('--bar-height', `${Math.max(12, count / maxCount * 90)}%`);
    column.append(bar, create('span', '', category));
    column.title = `${category}: ${count} products`;
    chart.append(column);
  });
  categoryChart.append(chart);
  categoryCaption.textContent = `Product counts by category: ${[...counts.entries()].map(([category, count]) => `${category}, ${count}`).join('; ')}. This is catalog distribution, not sales.`;
};

const updateLocalProducts = () => {
  const localProducts = readManagedProducts();
  localProductsValue.textContent = String(localProducts.length);
  updateCategoryChart(window.northstarApiProducts || [], localProducts);
};

const updateDashboard = async () => {
  updateUsers();
  updateCartMetrics();
  updateActivity();
  const localProducts = readManagedProducts();
  localProductsValue.textContent = String(localProducts.length);
  apiProductsValue.textContent = 'Loading';
  try {
    const apiProducts = await fetchProducts();
    window.northstarApiProducts = apiProducts;
    apiProductsValue.textContent = String(apiProducts.length);
    updateCategoryChart(apiProducts, localProducts);
  } catch {
    window.northstarApiProducts = [];
    apiProductsValue.textContent = 'Unavailable';
    updateCategoryChart([], localProducts);
  }
};

document.addEventListener('northstar:cart-change', (event) => updateCartMetrics(event.detail));
document.addEventListener('northstar:activity-change', (event) => updateActivity(event.detail));
document.addEventListener('northstar:users-change', updateUsers);
document.addEventListener('northstar:managed-products-change', updateLocalProducts);
updateDashboard();
}