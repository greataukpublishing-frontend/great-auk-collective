import { createContext, useContext, useState, ReactNode } from "react";

interface CartItem {
  id: number;
  title: string;
  author: string;
  price: number;
  cover: string;
  quantity: number;
  format: string;
}

interface CartContextType {
  cartItems: CartItem[];
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
  itemCount: number;
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, qty: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 1,
      title: "The Silent Ocean",
      author: "Jane Rivers",
      price: 14.99,
      cover: "https://via.placeholder.com/200x300",
      quantity: 1,
      format: "eBook",
    },
    {
      id: 2,
      title: "Whispers of the Ancient Forest",
      author: "Elara Green",
      price: 19.99,
      cover: "https://via.placeholder.com/200x300",
      quantity: 2,
      format: "Paperback",
    },
  ]);

  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = (item: Omit<CartItem, "quantity">) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: number) =>
    setCartItems((prev) => prev.filter((item) => item.id !== id));

  const updateQuantity = (id: number, newQuantity: number) =>
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, newQuantity) } : item
      )
    );

  return (
    <CartContext.Provider
      value={{ cartItems, setCartItems, itemCount, addToCart, removeFromCart, updateQuantity }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
