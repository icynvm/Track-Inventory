
import React, { useState } from 'react';
import { storageService } from '../services/storageService';

interface SettingsModalProps {
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const [url, setUrl] = useState(storageService.getWebhookUrl());

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = url.trim();
    if (cleanUrl && !cleanUrl.includes('script.google.com')) {
      alert("Invalid matrix address.");
      return;
    }
    storageService.setWebhookUrl(cleanUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 backdrop-blur-xl p-4 animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-white/10 rounded-[3rem] shadow-2xl w-full max-w-lg overflow-hidden transform animate-in zoom-in duration-500">
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
          <div>
            <h2 className="text-2xl font-extrabold text-white tracking-tighter uppercase">Cloud Link</h2>
            <p className="text-[10px] font-bold text-orange-500 uppercase tracking-[0.4em] mt-1">Satellite Matrix Sync</p>
          </div>
          <button onClick={onClose} className="w-12 h-12 flex items-center justify-center glass rounded-2xl text-slate-500 hover:text-white transition-all shadow-sm">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <form onSubmit={handleSave} className="p-10 space-y-8">
          <div className="bg-orange-500/5 border border-orange-500/10 p-6 rounded-3xl">
            <h4 className="text-[10px] font-extrabold text-orange-400 uppercase tracking-widest mb-4 flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              DEPLOYMENT_CORE_GUIDE
            </h4>
            <ul className="text-[11px] text-slate-400 leading-relaxed font-medium list-disc ml-5 space-y-2">
              <li>GAS: Deploy as <span className="text-white">"Anyone"</span> access.</li>
              <li>Execute as <span className="text-white">"Me"</span> (Admin).</li>
              <li>Ensure Sheet API is active in Cloud Console.</li>
            </ul>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold text-slate-600 uppercase tracking-[0.3em] mb-3">MATRIX_WEBHOOK_EXEC</label>
            <textarea
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/.../exec"
              className="w-full px-5 py-5 bg-black border border-white/5 rounded-2xl focus:border-white/20 outline-none transition-all font-mono text-[11px] text-orange-400 h-32 resize-none shadow-inner"
            />
          </div>

          <div className="flex gap-4 pt-2">
            <button type="button" onClick={() => { setUrl(''); storageService.setWebhookUrl(''); }} className="px-8 py-4 glass text-slate-600 font-extrabold text-[11px] uppercase tracking-widest rounded-2xl hover:text-red-400 transition-all">PURGE_LINK</button>
            <button type="submit" className="flex-1 py-4 bg-white hover:bg-slate-200 text-slate-950 font-extrabold text-[11px] uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-white/5">ESTABLISH_LINK</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsModal;
