
import { Equipment, AuditLog } from '../types';

/**
 * Robustly get the Webhook URL. 
 * Checks localStorage first (user override), then Vite environment variables.
 */
const getWebhookUrl = (): string => {
  const override = localStorage.getItem('equiptrack_webhook_override');
  if (override) return override;

  // @ts-ignore
  const env = import.meta.env;
  if (env && env.VITE_SHEET_WEBHOOK_URL) {
    return env.VITE_SHEET_WEBHOOK_URL;
  }
  return '';
};

export const storageService = {
  getWebhookUrl,
  
  setWebhookUrl(url: string) {
    if (!url) {
      localStorage.removeItem('equiptrack_webhook_override');
    } else {
      localStorage.setItem('equiptrack_webhook_override', url);
    }
    // Reload to apply changes across service
    window.location.reload();
  },

  async callWebhook(action: string, payload: any = {}) {
    const url = getWebhookUrl();
    if (!url) {
      console.warn("Google Sheet Webhook URL not configured.");
      return this.fallback(action, payload);
    }

    try {
      await fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({ action, ...payload })
      });
      return true;
    } catch (error) {
      console.error("Webhook POST Error:", error);
      return false;
    }
  },

  async getItems(): Promise<Equipment[]> {
    const url = getWebhookUrl();
    if (!url) return JSON.parse(localStorage.getItem('equiptrack_data') || '[]');
    
    try {
      const res = await fetch(`${url}?type=inventory`, {
        method: 'GET',
        redirect: 'follow'
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      const cleaned = data.filter((item: any) => item.id);
      localStorage.setItem('equiptrack_data', JSON.stringify(cleaned));
      return cleaned;
    } catch (e) {
      console.error("Fetch Items Error, using local cache:", e);
      return JSON.parse(localStorage.getItem('equiptrack_data') || '[]');
    }
  },

  async getLogs(): Promise<AuditLog[]> {
    const url = getWebhookUrl();
    if (!url) return JSON.parse(localStorage.getItem('equiptrack_logs') || '[]');
    
    try {
      const res = await fetch(`${url}?type=logs`, {
        method: 'GET',
        redirect: 'follow'
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
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

  async deleteItem(id: string): Promise<void> {
    await this.callWebhook('delete_item', { id });
    const items = JSON.parse(localStorage.getItem('equiptrack_data') || '[]');
    const filtered = items.filter((i: any) => i.id !== id);
    localStorage.setItem('equiptrack_data', JSON.stringify(filtered));
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
