import { createContext, useContext, useState } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product, quantity = 1) => {
    const existing = cartItems.find((item) => item.id === product.id);
    const requestedQuantity = existing ? existing.quantity + quantity : quantity;
    const available = product.availableQuantity ?? product.quantity ?? 0;

    if (requestedQuantity > available) {
      toast.error(`عذراً، الكمية المطلوبة أكبر من المتوفر. المتاح: ${available}`);
      return;
    }

    setCartItems((prev) => {
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: requestedQuantity }
            : item
        );
      }
      return [...prev, { ...product, quantity, availableQuantity: available }];
    });
    toast.success(`تم إضافة ${product.name} إلى السلة`);
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
    toast.success('تم إزالة المنتج من السلة');
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const item = cartItems.find((i) => i.id === productId);
    if (item && quantity > item.availableQuantity) {
      toast.error(`عذراً، لا يمكن طلب أكثر من المتوفر. المتاح: ${item.availableQuantity}`);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartCount,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}
