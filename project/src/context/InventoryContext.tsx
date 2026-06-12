import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getActiveRedemptions, markRedemptionUsed } from '../services/redemptions';

export type InventoryItemType = 'coupon' | 'ticket' | 'reward';

export interface InventoryItem {
  id: string;
  type: InventoryItemType;
  title: string;
  description: string;
  expires: string;
  code: string;
  used: boolean;
  quantity: number;
  image: string;
  points: number;
  barcode?: string;
}

interface InventoryContextType {
  items: InventoryItem[];
  isLoading: boolean;
  reload: () => Promise<void>;
  markUsed: (id: string) => Promise<void>;
  getByCode: (code: string) => InventoryItem | undefined;
  getByBarcode: (barcode: string) => InventoryItem | undefined;
}

const InventoryContext = createContext<InventoryContextType | null>(null);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { authUser, isAuthenticated } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const reload = useCallback(async () => {
    if (!authUser?.id) {
      setItems([]);
      return;
    }
    setIsLoading(true);
    try {
      const redemptions = await getActiveRedemptions(authUser.id);
      const mapped: InventoryItem[] = redemptions.map((r) => {
        const reward = (r as unknown as { rewards?: { title?: string; image?: string; category?: string; description?: string; points?: number } }).rewards;
        return {
          id: r.id,
          type: (reward?.category === 'ticket' ? 'ticket' : 'reward') as InventoryItemType,
          title: reward?.title ?? 'Reward',
          description: reward?.description ?? '',
          expires: r.expires_at ?? '',
          code: r.code,
          used: r.used,
          quantity: 1,
          image: reward?.image ?? '',
          points: reward?.points ?? r.points_spent,
          barcode: r.barcode ?? undefined,
        };
      });
      setItems(mapped);
    } catch (err) {
      console.error('Failed to load inventory:', err);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [authUser?.id]);

  useEffect(() => {
    if (isAuthenticated) {
      reload();
    } else {
      setItems([]);
    }
  }, [isAuthenticated, reload]);

  const markUsed = async (id: string) => {
    if (!authUser?.id) return;
    try {
      await markRedemptionUsed(id, authUser.id);
      setItems(prev => prev.map(i => i.id === id ? { ...i, used: true, quantity: 0 } : i));
    } catch (err) {
      console.error('Failed to mark used:', err);
    }
  };

  const getByCode = (code: string) =>
    items.find(i => i.code.toUpperCase() === code.toUpperCase().trim());

  const getByBarcode = (barcode: string) =>
    items.find(i => i.barcode && i.barcode.trim() === barcode.trim());

  return (
    <InventoryContext.Provider value={{ items, isLoading, reload, markUsed, getByCode, getByBarcode }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = (): InventoryContextType => {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error('useInventory must be used within InventoryProvider');
  return ctx;
};
