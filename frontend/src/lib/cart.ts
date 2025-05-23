import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  storeId: string;
  storeName: string;
  addedAt?: number; // Timestamp when item was added
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  discount: number;
  updateDiscount: (amount: number) => void;
  lastActivityTimestamp: number;
  updateLastActivity: () => void;
}

const INACTIVITY_TIMEOUT = 60 * 1000; // 1 minute in milliseconds

// Only attempt to notify AI agent if we're in production
const AI_AGENT_URL = import.meta.env.PROD ? 'http://localhost:5000/api' : null;

async function notifyAiAgent(cartItems: CartItem[], total: number) {
  // Skip notification if AI agent URL is not configured
  if (!AI_AGENT_URL) {
    console.debug('AI agent notification skipped - not configured for development environment');
    return;
  }

  try {
    const response = await fetch(AI_AGENT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: cartItems,
        total,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`AI agent notification failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.debug('AI agent notification successful:', data);
  } catch (error) {
    // Log error but don't throw - this is a non-critical feature
    console.warn('AI agent notification failed:', error);
  }
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      discount: 0,
      lastActivityTimestamp: Date.now(),

      updateLastActivity: () => {
        set({ lastActivityTimestamp: Date.now() });
      },

      addItem: (item) => {
        const items = get().items;
        const existingItem = items.find((i) => i.id === item.id);
        const now = Date.now();

        if (existingItem) {
          set({
            items: items.map((i) =>
              i.id === item.id
                ? { ...i, quantity: i.quantity + 1, addedAt: now }
                : i
            ),
            total: get().total + item.price,
            lastActivityTimestamp: now,
          });
        } else {
          set({
            items: [...items, { ...item, quantity: 1, addedAt: now }],
            total: get().total + item.price,
            lastActivityTimestamp: now,
          });
        }

        // Set up timeout for AI agent notification
        setTimeout(() => {
          const currentState = get();
          const timeSinceLastActivity = Date.now() - currentState.lastActivityTimestamp;

          // Only notify if there has been no activity for the timeout period and there are items in the cart
          if (timeSinceLastActivity >= INACTIVITY_TIMEOUT && currentState.items.length > 0) {
            notifyAiAgent(currentState.items, currentState.total);
          }
        }, INACTIVITY_TIMEOUT);
      },

      removeItem: (itemId) => {
        const items = get().items;
        const item = items.find((i) => i.id === itemId);
        if (item) {
          set({
            items: items.filter((i) => i.id !== itemId),
            total: get().total - item.price * item.quantity,
            lastActivityTimestamp: Date.now(),
          });
        }
      },

      updateQuantity: (itemId, quantity) => {
        const items = get().items;
        const item = items.find((i) => i.id === itemId);
        if (item) {
          const priceDiff = (quantity - item.quantity) * item.price;
          set({
            items: items.map((i) =>
              i.id === itemId ? { ...i, quantity, addedAt: Date.now() } : i
            ),
            total: get().total + priceDiff,
            lastActivityTimestamp: Date.now(),
          });
        }
      },

      updateDiscount: (amount) => {
        set({ 
          discount: amount,
          lastActivityTimestamp: Date.now()
        });
      },

      clearCart: () => set({ 
        items: [], 
        total: 0, 
        discount: 0,
        lastActivityTimestamp: Date.now()
      }),
    }),
    {
      name: 'cart-storage',
    }
  )
);