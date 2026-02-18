
import { Equipment, AuditLog } from '../types';

/**
 * Robustly get the Webhook URL from Vite environment variables.
 * In Vite, variables must be prefixed with VITE_ to be exposed to the client.
 */
const getWebhookUrl = (): string => {
  // @ts-ignore
  const env = import.meta.env;
  if (env && env.VITE_SHEET_WEBHOOK_URL) {
    return env.VITE_SHEET_WEBHOOK_URL;
  }
  return '';
};

const SHEET_WEBHOOK_URL = getWebhookUrl();

export const storageService = {
  // Helper to handle API calls
  async callWebhook(action: string, payload: any = {}) {
    if (!SHEET_WEBHOOK_URL) {
      console.warn("Google Sheet Webhook URL not configured. Go to Vercel Settings > Environment Variables and add VITE_SHEET_WEBHOOK_URL.");
      return this.fallback(action, payload);
    }

    try {
      // POST requests to Google Apps Script
      await fetch(SHEET_WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...payload })
      });
      return true;
    } catch (error) {
      console.error("Webhook Error:", error);
      return false;
    }
  },

  async getItems(): Promise<Equipment[]> {
    if (!SHEET_WEBHOOK_URL) return JSON.parse(localStorage.getItem('equiptrack_data') || '[]');
    
    try {
      const res = await fetch(`${SHEET_WEBHOOK_URL}?type=inventory`);
      const data = await res.json();
      // Clean undefined values from the fetch
      const cleaned = data.filter((item: any) => item.id);
      localStorage.setItem('equiptrack_data', JSON.stringify(cleaned));
      return cleaned;
    } catch (e) {
      console.error("Fetch Items Error, using local cache:", e);
      return JSON.parse(localStorage.getItem('equiptrack_data') || '[]');
    }
  },

  async getLogs(): Promise<AuditLog[]> {
    if (!SHEET_WEBHOOK_URL) return JSON.parse(localStorage.getItem('equiptrack_logs') || '[]');
    
    try {
      const res = await fetch(`${SHEET_WEBHOOK_URL}?type=logs`);
      const data = await res.json();
      const cleaned = data.filter((log: any) => log.id);
      localStorage.setItem('equiptrack_logs', JSON.stringify(cleaned));
      return cleaned;
    } catch (e) {
      console.error("Fetch Logs Error, using local cache:", e);
      return JSON.parse(localStorage.getItem('equiptrack_logs') || '[]');
    }
  },

  async updateItem(updatedItem: Equipment): Promise<void> {
    const item = { ...updatedItem, lastActionDate: new Date().toISOString() };
    await this.callWebhook('update_item', { item });
    this.fallback('update_item', { item });
  },

  async addItem(item: Equipment): Promise<void> {
    await this.callWebhook('add_item', { item });
    this.fallback('add_item', { item });
  },

  async addLog(log: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void> {
    const newLog = { 
      ...log, 
      id: Math.random().toString(36).substr(2, 9), 
      timestamp: new Date().toISOString() 
    };
    await this.callWebhook('add_log', { log: newLog });
    this.fallback('add_log', { log: newLog });
  },

  fallback(action: string, payload: any) {
    if (action === 'add_item' || action === 'update_item') {
      const items = JSON.parse(localStorage.getItem('equiptrack_data') || '[]');
      const index = items.findIndex((i: any) => i.id === payload.item.id);
      if (index > -1) items[index] = payload.item;
      else items.push(payload.item);
      localStorage.setItem('equiptrack_data', JSON.stringify(items));
    }
    if (action === 'add_log') {
      const logs = JSON.parse(localStorage.getItem('equiptrack_logs') || '[]');
      logs.unshift(payload.log);
      localStorage.setItem('equiptrack_logs', JSON.stringify(logs.slice(0, 100)));
    }
  },

  getItemById: (id: string, items: Equipment[]): Equipment | undefined => {
    return items.find(item => item.id === id);
  }
};
