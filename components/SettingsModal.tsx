
import React, { useState } from 'react';
import { storageService } from '../services/storageService';

interface SettingsModalProps {
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const [url, setUrl] = useState(storageService.getWebhookUrl());

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.setWebhookUrl(url);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden transform animate-in zoom-in duration-300">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Cloud Config</h2>
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mt-1">Storage Synchronization</p>
          </div>
          <button onClick={onClose} className="w-12 h-12 flex items-center justify-center bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 transition-all shadow-sm">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <form onSubmit={handleSave} className="p-8 space-y-6">
          <div className="bg-blue-50/50 border border-blue-100 p-6 rounded-3xl">
            <h4 className="text-[10px] font-black text-blue-700 uppercase tracking-widest mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Integration Guide
            </h4>
            <p className="text-xs text-blue-800 leading-relaxed font-medium">
              Paste your Google Apps Script Web App URL here. This will override any pre-configured environment variables and save directly to this browser.
            </p>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Web App Executable URL</label>
            <textarea
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/.../exec"
              className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:bg-white outline-none transition-all font-mono text-xs text-slate-600 h-24 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button 
              type="button" 
              onClick={() => { setUrl(''); storageService.setWebhookUrl(''); }}
              className="px-6 py-4 bg-slate-100 text-slate-400 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all"
            >
              Reset
            </button>
            <button 
              type="submit" 
              className="flex-1 py-4 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-blue-600 transition-all shadow-xl shadow-slate-200"
            >
              Synchronize Terminal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsModal;
