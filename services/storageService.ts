
import { Equipment, AuditLog } from '../types';

/**
 * Robustly get the Webhook URL. 
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
    window.location.reload();
  },

  /**
   * Fast asynchronous webhook call.
   */
  async callWebhook(action: string, payload: any = {}) {
    const url = getWebhookUrl();
    if (!url) return false;

    try {
      // Using mode: no-cors ensures the call is as fast as possible 
      // because the browser doesn't wait for a full response stream or CORS preflight.
      const response = await fetch(url, {
        method: 'POST',
        mode: 'no-cors', 
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({ action, ...payload })
      });
      return true;
    } catch (error) {
      console.warn("Background Sync Warning:", error);
      return false;
    }
  },

  async getItems(): Promise<Equipment[]> {
    const url = getWebhookUrl();
    if (!url) return JSON.parse(localStorage.getItem('equiptrack_data') || '[]');
    
    try {
      const res = await fetch(`${url}?type=inventory`, {
        method: 'GET',
        mode: 'cors',
        redirect: 'follow'
      });
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      const data = await res.json();
      const cleaned = data.filter((item: any) => item.id && item.id !== 'id');
      localStorage.setItem('equiptrack_data', JSON.stringify(cleaned));
      return cleaned;
    } catch (e) {
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
      return JSON.parse(localStorage.getItem('equiptrack_logs') || '[]');
    }
  },

  async updateItem(updatedItem: Equipment): Promise<void> {
    const item = { ...updatedItem, lastActionDate: new Date().toISOString() };
    this.localSync('update_item', { item });
    await this.callWebhook('update_item', { item });
  },

  async addItem(item: Equipment): Promise<void> {
    this.localSync('add_item', { item });
    await this.callWebhook('add_item', { item });
  },

  async deleteItem(id: string): Promise<void> {
    const items = JSON.parse(localStorage.getItem('equiptrack_data') || '[]');
    const filtered = items.filter((i: any) => i.id !== id);
    localStorage.setItem('equiptrack_data', JSON.stringify(filtered));
    await this.callWebhook('delete_item', { id });
  },

  async addLog(log: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void> {
    const newLog = { 
      ...log, 
      id: Math.random().toString(36).substr(2, 9), 
      timestamp: new Date().toISOString() 
    };
    this.localSync('add_log', { log: newLog });
    await this.callWebhook('add_log', { log: newLog });
  },

  localSync(action: string, payload: any) {
    if (action === 'add_item' || action === 'update_item') {
      const items = JSON.parse(localStorage.getItem('equiptrack_data') || '[]');
      const index = items.findIndex((i: any) => i.id === payload.item.id);
      if (index > -1) items[index] = payload.item;
      else items.unshift(payload.item);
      localStorage.setItem('equiptrack_data', JSON.stringify(items));
    }
    if (action === 'add_log') {
      const logs = JSON.parse(localStorage.getItem('equiptrack_logs') || '[]');
      logs.unshift(payload.log);
      localStorage.setItem('equiptrack_logs', JSON.stringify(logs.slice(0, 100)));
    }
  }
};
