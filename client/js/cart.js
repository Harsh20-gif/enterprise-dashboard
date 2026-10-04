import { readCartStorage, writeCartStorage } from './storage.js';

let cart = readCartStorage();

const announceChange = () => {
  writeCartStorage(cart);
  if (typeof document !== 'undefined') {
    document.dispatchEvent(new CustomEvent('northstar:cart-change', { detail: getCartSummary() }));
  }
};

export const getCart = () => cart.map((item) => ({ ...item }));

export const getCartSummary = () => ({
  quantity: cart.reduce((sum, item) => sum + item.quantity, 0),
  subtotal: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
  items: getCart()
});

export const addToCart = (product) => {
  if (!product || !Number.isInteger(product.id) || !Number.isFinite(product.price)) {
    throw new TypeError('A valid product is required to add it to the cart.');
  }
  const existing = cart.find((item) => item.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      category: product.category,
      quantity: 1
    });
  }
  announceChange();
  return getCartSummary();
};

export const setCartQuantity = (productId, quantity) => {
  const existing = cart.find((item) => item.id === Number(productId));
  if (!existing || !Number.isInteger(quantity)) return getCartSummary();
  if (quantity < 1) {
    cart = cart.filter((item) => item.id !== existing.id);
  } else {
    existing.quantity = quantity;
  }
  announceChange();
  return getCartSummary();
};

export const removeFromCart = (productId) => {
  const nextCart = cart.filter((item) => item.id !== Number(productId));
  if (nextCart.length !== cart.length) {
    cart = nextCart;
    announceChange();
  }
  return getCartSummary();
};