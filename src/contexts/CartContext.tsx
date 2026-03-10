import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";

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
  clearCart: () => void;
}

const CART_STORAGE_KEY = "great-auk-cart";

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

function saveCart(items: CartItem[]) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>(loadCart);
  const { user } = useAuth();
  const prevUserRef = useRef<string | null>(null);

  // Persist cart to localStorage on every change
  useEffect(() => {
    saveCart(cartItems);
  }, [cartItems]);

  // On login: merge guest cart with any previously saved user cart
  // On logout: keep cart items in localStorage (don't clear)
  useEffect(() => {
    const currentUserId = user?.id ?? null;
    const prevUserId = prevUserRef.current;

    if (currentUserId && !prevUserId) {
      // User just logged in - load any user-specific cart and merge with guest cart
      const userCartKey = `${CART_STORAGE_KEY}-${currentUserId}`;
      try {
        const raw = localStorage.getItem(userCartKey);
        if (raw) {
          const userCart: CartItem[] = JSON.parse(raw);
          if (Array.isArray(userCart) && userCart.length > 0) {
            setCartItems((guestItems) => {
              const merged = [...userCart];
              for (const guestItem of guestItems) {
                const existing = merged.find((i) => i.id === guestItem.id && i.format === guestItem.format);
                if (existing) {
                  existing.quantity += guestItem.quantity;
                } else {
                  merged.push(guestItem);
                }
              }
              return merged;
            });
          }
        }
      } catch {}
    }

    if (!currentUserId && prevUserId) {
      // User just logged out - save current cart as user's cart for future merge
      const userCartKey = `${CART_STORAGE_KEY}-${prevUserId}`;
      saveCart(cartItems);
      localStorage.setItem(userCartKey, JSON.stringify(cartItems));
      // Don't clear - keep items visible as guest cart
    }

    prevUserRef.current = currentUserId;
  }, [user?.id]);

  // Also save user-specific cart periodically when logged in
  useEffect(() => {
    if (user?.id) {
      const userCartKey = `${CART_STORAGE_KEY}-${user.id}`;
      localStorage.setItem(userCartKey, JSON.stringify(cartItems));
    }
  }, [cartItems, user?.id]);

  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = (item: Omit<CartItem, "quantity">) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === item.id && i.format === item.format);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id && i.format === item.format ? { ...i, quantity: i.quantity + 1 } : i
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

  const clearCart = () => {
    setCartItems([]);
    // Also clear user-specific cart on checkout
    if (user?.id) {
      localStorage.removeItem(`${CART_STORAGE_KEY}-${user.id}`);
    }
  };

  return (
    <CartContext.Provider
      value={{ cartItems, setCartItems, itemCount, addToCart, removeFromCart, updateQuantity, clearCart }}
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
