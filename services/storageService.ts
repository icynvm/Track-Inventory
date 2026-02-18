
import { Equipment, AuditLog } from '../types';

/**
 * Robustly get the Webhook URL. 
 * Checks localStorage first (user override), then Vite environment variables.
 */
const getWebhookUrl = (): string => {
  const override = localStorage.getItem('equiptrack_webhook_override');
  if (override) return override.trim();

  // @ts-ignore
  const env = import.meta.env;
  if (env && env.VITE_SHEET_WEBHOOK_URL) {
    return env.VITE_SHEET_WEBHOOK_URL.trim();
  }
  return '';
};

export const storageService = {
  getWebhookUrl,
  
  setWebhookUrl(url: string) {
    if (!url) {
      localStorage.removeItem('equiptrack_webhook_override');
    } else {
      localStorage.setItem('equiptrack_webhook_override', url.trim());
    }
    // Reload to apply changes across service
    window.location.reload();
  },

  /**
   * Sending data to Google Apps Script.
   * CRITICAL: We do NOT set 'Content-Type'. This makes it a 'Simple Request'.
   * Google Apps Script can read the body via e.postData.contents.
   * We use mode: 'no-cors' because we don't need to read the 'Success' string,
   * just ensure the data is sent.
   */
  async callWebhook(action: string, payload: any = {}) {
    const url = getWebhookUrl();
    if (!url) return false;

    try {
      await fetch(url, {
        method: 'POST',
        mode: 'no-cors', 
        // FIX: Corrected 'header' to 'headers' as expected by fetch's RequestInit
        headers: {
          // Empty headers to maintain "Simple Request" status
        },
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
      // GET requests require 'cors' and 'redirect: follow' for GAS
      const res = await fetch(`${url}?type=inventory`, {
        method: 'GET',
        mode: 'cors',
        redirect: 'follow'
      });
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      const data = await res.json();
      // Filter out any rows that don't have an ID (header rows or empty rows)
      const cleaned = data.filter((item: any) => item.id && item.id !== 'id');
      localStorage.setItem('equiptrack_data', JSON.stringify(cleaned));
      return cleaned;
    } catch (e) {
      console.error("Fetch Items Error:", e);
      return JSON.parse(localStorage.getItem('equiptrack_data') || '[]');
    }
  },

  async getLogs(): Promise<AuditLog[]> {
    const url = getWebhookUrl();
    if (!url) return JSON.parse(localStorage.getItem('equiptrack_logs') || '[]');
    
    try {
      const res = await fetch(`${url}?type=logs`, {
        method: 'GET',
        mode: 'cors',
        redirect: 'follow'
      });
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      const data = await res.json();
      const cleaned = data.filter((log: any) => log.id && log.id !== 'id');
      localStorage.setItem('equiptrack_logs', JSON.stringify(cleaned));
      return cleaned;
    } catch (e) {
      console.error("Fetch Logs Error:", e);
      return JSON.parse(localStorage.getItem('equiptrack_logs') || '[]');
    }
  },

  async updateItem(updatedItem: Equipment): Promise<void> {
    const item = { ...updatedItem, lastActionDate: new Date().toISOString() };
    await this.callWebhook('update_item', { item });
    this.localSync('update_item', { item });
  },

  async addItem(item: Equipment): Promise<void> {
    await this.callWebhook('add_item', { item });
    this.localSync('add_item', { item });
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
    this.localSync('add_log', { log: newLog });
  },

  localSync(action: string, payload: any) {
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
