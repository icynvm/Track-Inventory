
import { Equipment, AuditLog, EquipmentStatus } from '../types';

const STORAGE_KEY = 'equiptrack_data';
const LOGS_KEY = 'equiptrack_logs';

const INITIAL_DATA: Equipment[] = [
  { id: 'EQ-001', name: 'Canon EOS R5 Camera', category: 'Photography', status: EquipmentStatus.AVAILABLE, lastActionDate: new Date().toISOString(), imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=200' },
  { id: 'EQ-002', name: 'DJI Ronin 4D Gimbal', category: 'Stabilization', status: EquipmentStatus.IN_USE, currentHolder: 'Sarah Johnson', projectName: 'Neon Nights Music Video', lastActionDate: new Date().toISOString(), imageUrl: 'https://images.unsplash.com/photo-1594463750939-ebb6bd99c03c?auto=format&fit=crop&q=80&w=200' },
  { id: 'EQ-003', name: 'Sennheiser MKH 416', category: 'Audio', status: EquipmentStatus.AVAILABLE, lastActionDate: new Date().toISOString(), imageUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=200' },
  { id: 'EQ-004', name: 'Arri Orbiter LED', category: 'Lighting', status: EquipmentStatus.MAINTENANCE, lastActionDate: new Date().toISOString(), imageUrl: 'https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?auto=format&fit=crop&q=80&w=200' },
  { id: 'EQ-005', name: 'MacBook Pro M3 Max', category: 'Computing', status: EquipmentStatus.AVAILABLE, lastActionDate: new Date().toISOString(), imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=200' },
];

export const storageService = {
  getItems: (): Equipment[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
      return INITIAL_DATA;
    }
    return JSON.parse(data);
  },

  getItemById: (id: string): Equipment | undefined => {
    const items = storageService.getItems();
    return items.find(item => item.id === id);
  },

  updateItem: (updatedItem: Equipment): void => {
    const items = storageService.getItems();
    const index = items.findIndex(item => item.id === updatedItem.id);
    if (index !== -1) {
      items[index] = { ...updatedItem, lastActionDate: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  },

  addItem: (item: Equipment): void => {
    const items = storageService.getItems();
    items.push(item);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  },

  deleteItem: (id: string): void => {
    const items = storageService.getItems();
    const filtered = items.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  },

  getLogs: (): AuditLog[] => {
    const logs = localStorage.getItem(LOGS_KEY);
    return logs ? JSON.parse(logs) : [];
  },

  addLog: (log: Omit<AuditLog, 'id' | 'timestamp'>): void => {
    const logs = storageService.getLogs();
    const newLog: AuditLog = {
      ...log,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString()
    };
    logs.unshift(newLog); // Newest first
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs.slice(0, 100))); // Keep last 100 logs
  }
};
