import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../contexts/CartContext';

const CartSidebar = ({ isOpen, onClose }) => {
  const { cartItems, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCart();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 20, stiffness: 200 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                Your Cart ({cartItems.length})
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors duration-200"
              >
                <i className="fas fa-times text-gray-500"></i>
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {cartItems.length === 0 ? (
                <div className="text-center py-12">
                  <i className="fas fa-shopping-cart text-6xl text-gray-300 mb-4"></i>
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Your cart is empty</h3>
                  <p className="text-gray-500 mb-6">Add some services to get started</p>
                  <Link
                    to="/services"
                    onClick={onClose}
                    className="inline-flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition-colors duration-300"
                  >
                    Browse Services
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <motion.div
                      key={item._id}
                      className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      layout
                    >
                      <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <i className="fas fa-tools text-white text-xl"></i>
                        )}
                      </div>

                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-600">{item.provider?.name || 'Professional'}</p>
                        <p className="text-lg font-bold text-primary-600">₹{item.price}</p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 transition-colors duration-200"
                          disabled={item.quantity <= 1}
                        >
                          <i className="fas fa-minus text-xs"></i>
                        </button>
                        
                        <span className="w-8 text-center font-semibold">
                          {item.quantity}
                        </span>
                        
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 transition-colors duration-200"
                        >
                          <i className="fas fa-plus text-xs"></i>
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="w-8 h-8 flex items-center justify-center rounded-full text-red-500 hover:bg-red-50 transition-colors duration-200"
                      >
                        <i className="fas fa-trash text-sm"></i>
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="border-t border-gray-200 p-6 space-y-4">
                {/* Total */}
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-primary-600">₹{getTotalPrice()}</span>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Link
                    to="/checkout"
                    onClick={onClose}
                    className="w-full bg-primary-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-600 transition-colors duration-300 flex items-center justify-center"
                  >
                    <i className="fas fa-credit-card mr-2"></i>
                    Proceed to Checkout
                  </Link>

                  <button
                    onClick={() => {
                      clearCart();
                      onClose();
                    }}
                    className="w-full bg-white text-red-500 border-2 border-red-500 py-3 px-4 rounded-lg font-semibold hover:bg-red-50 transition-colors duration-300 flex items-center justify-center"
                  >
                    <i className="fas fa-trash mr-2"></i>
                    Clear Cart
                  </button>
                </div>

                {/* Continue Shopping */}
                <button
                  onClick={onClose}
                  className="w-full text-gray-600 hover:text-gray-800 py-2 text-sm transition-colors duration-200"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CartSidebar;
