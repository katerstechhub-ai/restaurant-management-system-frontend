import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'cart';

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(loadCart); // [{ menuItem, name, price, imageUrl, quantity, customizations }]

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // storage full or unavailable — cart just won't persist this time
    }
  }, [cart]);

  const addItem = (menuItem) => {
    const existingIndex = findIndex(cart, menuItem._id);
    if (existingIndex >= 0) {
      const next = [];
      for (let i = 0; i < cart.length; i++) {
        if (i === existingIndex) {
          next.push({ ...cart[i], quantity: cart[i].quantity + 1 });
        } else {
          next.push(cart[i]);
        }
      }
      setCart(next);
      return;
    }
    setCart([
      ...cart,
      {
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        imageUrl: menuItem.image,
        quantity: 1,
        customizations: '',
      },
    ]);
  };

  const changeQuantity = (menuItemId, delta) => {
    const next = [];
    for (let i = 0; i < cart.length; i++) {
      const line = cart[i];
      if (line.menuItem === menuItemId) {
        const newQty = line.quantity + delta;
        if (newQty > 0) next.push({ ...line, quantity: newQty });
        // if newQty is 0 or less, line is dropped (removed from cart)
      } else {
        next.push(line);
      }
    }
    setCart(next);
  };

  const setCustomizations = (menuItemId, text) => {
    const next = [];
    for (let i = 0; i < cart.length; i++) {
      const line = cart[i];
      if (line.menuItem === menuItemId) {
        next.push({ ...line, customizations: text });
      } else {
        next.push(line);
      }
    }
    setCart(next);
  };

  const clearCart = () => setCart([]);

  const total = () => {
    let sum = 0;
    for (let i = 0; i < cart.length; i++) {
      sum += cart[i].price * cart[i].quantity;
    }
    return sum;
  };

  return (
    <CartContext.Provider value={{ cart, addItem, changeQuantity, setCustomizations, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
}

function findIndex(cart, menuItemId) {
  for (let i = 0; i < cart.length; i++) {
    if (cart[i].menuItem === menuItemId) return i;
  }
  return -1;
}

export function useCart() {
  return useContext(CartContext);
}