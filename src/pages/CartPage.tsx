import { useState } from "react";
import { Link } from "react-router-dom"; // Assuming you have react-router-dom for navigation

export default function CartPage() {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      title: "The Silent Ocean",
      author: "Jane Rivers",
      price: 14.99,
      cover: "https://via.placeholder.com/100x140",
      quantity: 1, // Added quantity for cart functionality
    },
    {
      id: 2,
      title: "Whispers of the Ancient Forest",
      author: "Elara Green",
      price: 19.99,
      cover: "https://via.placeholder.com/100x140",
      quantity: 2,
    },
  ] );

  const removeItem = (id) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  const updateQuantity = (id, newQuantity) => {
    setCartItems(cartItems.map(item => 
      item.id === id ? { ...item, quantity: Math.max(1, newQuantity) } : item
    ));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 0 ? 5.00 : 0; // Example shipping cost
  const total = subtotal + shipping;

  return (
    <div className="container mx-auto px-4 py-12 font-sans bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-semibold text-[#1E392A] mb-10 tracking-tight">
        Your Shopping Cart
      </h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg shadow-inner border border-gray-100">
          <div className="text-6xl mb-6">🛒</div>
          <h2 className="text-2xl font-medium text-[#1E392A] mb-3">
            Your cart is empty
          </h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Looks like you haven't added anything to your cart yet. Explore our bookstore to find your next read!
          </p>
          <Link
            to="/bookstore"
            className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-[#1E392A] hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#EAB333] transition-colors duration-200"
          >
            Go to Bookstore
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {cartItems.map((book) => (
              <div
                key={book.id}
                className="flex items-center gap-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100"
              >
                <Link to={`/book/${book.id}`}>
                  <img
                    src={book.cover}
                    alt={book.title}
                    className="w-24 h-36 object-cover rounded-lg shadow-md"
                  />
                </Link>
                <div className="flex-1 flex flex-col justify-between h-36">
                  <div>
                    <Link to={`/book/${book.id}`} className="block">
                      <h2 className="text-xl font-semibold text-[#1E392A] leading-tight hover:text-green-700 transition-colors duration-200">
                        {book.title}
                      </h2>
                    </Link>
                    <p className="text-sm text-gray-500 mt-1">by {book.author}</p>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(book.id, book.quantity - 1)}
                        className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200"
                      >
                        -
                      </button>
                      <span className="text-lg font-medium text-[#1E392A]">{book.quantity}</span>
                      <button
                        onClick={() => updateQuantity(book.id, book.quantity + 1)}
                        className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200"
                      >
                        +
                      </button>
                    </div>
                    <p className="text-xl font-bold text-[#EAB333]">
                      ${(book.price * book.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeItem(book.id)}
                  className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors duration-200 self-start mt-2"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg border border-gray-100 h-fit">
            <h2 className="text-2xl font-semibold text-[#1E392A] mb-6">Order Summary</h2>
            <div className="space-y-3 text-gray-700">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 pt-4 mt-4 flex justify-between items-center text-xl font-bold text-[#1E392A]">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            <button className="w-full mt-8 inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-[#1E392A] hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#EAB333] transition-colors duration-200">
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
