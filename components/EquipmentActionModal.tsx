
import React, { useState } from 'react';
import { Equipment, EquipmentStatus } from '../types';

interface EquipmentActionModalProps {
  item: Equipment;
  onClose: () => void;
  onAction: (updatedItem: Equipment, userName: string, projectName?: string, notes?: string) => void;
}

const EquipmentActionModal: React.FC<EquipmentActionModalProps> = ({ item, onClose, onAction }) => {
  const [userName, setUserName] = useState(item.currentHolder || '');
  const [projectName, setProjectName] = useState(item.projectName || '');
  const [notes, setNotes] = useState('');
  const isCheckOut = item.status === EquipmentStatus.AVAILABLE;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;

    const updatedItem: Equipment = {
      ...item,
      status: isCheckOut ? EquipmentStatus.IN_USE : EquipmentStatus.AVAILABLE,
      currentHolder: isCheckOut ? userName : undefined,
      projectName: isCheckOut ? projectName : undefined,
    };

    onAction(updatedItem, userName, isCheckOut ? projectName : undefined, notes);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xl p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden transform animate-in zoom-in slide-in-from-bottom-10 duration-500">
        <div className="relative h-48 md:h-64 bg-slate-100 overflow-hidden">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-200">
              <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
          )}
          <div className="absolute top-6 right-6">
            <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-white/20 backdrop-blur-xl rounded-2xl text-white hover:bg-white hover:text-slate-900 transition-all border border-white/30">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-slate-900 to-transparent">
             <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-1">{item.category}</p>
             <h2 className="text-2xl font-black text-white tracking-tighter uppercase">{item.name}</h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="text-xs font-black text-slate-400 uppercase tracking-widest">Asset Status</div>
            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 ${
              isCheckOut ? 'bg-green-50 text-green-600 border-green-100' : 'bg-blue-50 text-blue-600 border-blue-100'
            }`}>
              {isCheckOut ? 'Available for Checkout' : 'Current Usage'}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                {isCheckOut ? 'Assign To (Personnel)' : 'Confirmed By'}
              </label>
              <input
                type="text"
                required
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:bg-white outline-none transition-all font-bold text-slate-900"
                placeholder="e.g. John Wick"
              />
            </div>

            {isCheckOut && (
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                  Project Title
                </label>
                <input
                  type="text"
                  required
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:bg-white outline-none transition-all font-bold text-slate-900"
                  placeholder="e.g. Summer Campaign 2024"
                />
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                Action Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:bg-white outline-none transition-all h-24 resize-none font-medium text-slate-600 text-sm"
                placeholder="Details on condition or location..."
              />
            </div>
          </div>

          <button
            type="submit"
            className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest text-white shadow-2xl transition-all active:scale-95 ${
              isCheckOut ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' : 'bg-slate-900 hover:bg-slate-800 shadow-slate-200'
            }`}
          >
            Confirm {isCheckOut ? 'Check Out' : 'Asset Return'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EquipmentActionModal;
