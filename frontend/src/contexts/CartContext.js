import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('homeease_cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('homeease_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (service) => {
    setCartItems(prevItems => {
      // Check if item already exists
      const existingItem = prevItems.find(item => item._id === service._id);
      
      if (existingItem) {
        toast.error('Item already in cart!');
        return prevItems;
      }

      toast.success(`${service.name} added to cart!`);
      return [...prevItems, { ...service, quantity: 1 }];
    });
  };

  const removeFromCart = (serviceId) => {
    setCartItems(prevItems => {
      const updatedItems = prevItems.filter(item => item._id !== serviceId);
      toast.success('Item removed from cart');
      return updatedItems;
    });
  };

  const updateQuantity = (serviceId, quantity) => {
    if (quantity < 1) {
      removeFromCart(serviceId);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item._id === serviceId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('homeease_cart');
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const isInCart = (serviceId) => {
    return cartItems.some(item => item._id === serviceId);
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  const closeCart = () => {
    setIsCartOpen(false);
  };

  const openCart = () => {
    setIsCartOpen(true);
  };

  const value = {
    cartItems,
    isCartOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    isInCart,
    toggleCart,
    closeCart,
    openCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
