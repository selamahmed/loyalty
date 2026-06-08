import React, { createContext, useContext, useState } from 'react';
import { inventory as initialInventory } from '../data/mockData';

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
}

interface InventoryContextType {
  items: InventoryItem[];
  addItem: (item: Omit<InventoryItem, 'id'>) => void;
  updateItem: (id: string, updates: Partial<InventoryItem>) => void;
  deleteItem: (id: string) => void;
  markUsed: (id: string) => void;
  getByCode: (code: string) => InventoryItem | undefined;
}

const InventoryContext = createContext<InventoryContextType | null>(null);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<InventoryItem[]>(
    (initialInventory as InventoryItem[]).map(i => ({
      ...i,
      quantity: i.quantity ?? 1,
      image: i.image ?? '',
      points: i.points ?? 0,
    }))
  );

  const addItem = (item: Omit<InventoryItem, 'id'>) =>
    setItems(prev => [{ ...item, id: Date.now().toString() }, ...prev]);

  const updateItem = (id: string, updates: Partial<InventoryItem>) =>
    setItems(prev => prev.map(i => (i.id === id ? { ...i, ...updates } : i)));

  const deleteItem = (id: string) =>
    setItems(prev => prev.filter(i => i.id !== id));

  const markUsed = (id: string) =>
    setItems(prev =>
      prev.map(i =>
        i.id === id
          ? { ...i, used: true, quantity: Math.max(0, (i.quantity ?? 1) - 1) }
          : i
      )
    );

  const getByCode = (code: string) =>
    items.find(i => i.code.toUpperCase() === code.toUpperCase().trim());

  return (
    <InventoryContext.Provider value={{ items, addItem, updateItem, deleteItem, markUsed, getByCode }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = (): InventoryContextType => {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error('useInventory must be used within InventoryProvider');
  return ctx;
};
