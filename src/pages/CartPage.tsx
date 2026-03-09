import { useState } from "react";

export default function CartPage() {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      title: "The Silent Ocean",
      author: "Jane Rivers",
      price: 14.99,
      cover: "https://via.placeholder.com/100x140",
    },
  ]);

  const removeItem = (id: number) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  const total = cartItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="p-10 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">My Cart 🛒</h1>

      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div className="space-y-6">
          {cartItems.map((book) => (
            <div
              key={book.id}
              className="flex items-center gap-6 border p-4 rounded-lg"
            >
              <img
                src={book.cover}
                alt={book.title}
                className="w-20 h-28 object-cover rounded"
              />

              <div className="flex-1">
                <h2 className="text-lg font-semibold">{book.title}</h2>
                <p className="text-sm text-gray-500">{book.author}</p>
                <p className="font-bold mt-1">${book.price}</p>
              </div>

              <button
                onClick={() => removeItem(book.id)}
                className="text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))}

          <div className="border-t pt-4 flex justify-between items-center">
            <h2 className="text-xl font-bold">Total: ${total.toFixed(2)}</h2>

            <button className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800">
              Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
