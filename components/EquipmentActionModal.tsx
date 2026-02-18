
import React, { useState } from 'react';
import { Equipment, EquipmentStatus } from '../types';

interface EquipmentActionModalProps {
  item: Equipment;
  onClose: () => void;
  onAction: (updatedItem: Equipment, userName: string, projectName?: string, notes?: string) => Promise<void>;
}

const EquipmentActionModal: React.FC<EquipmentActionModalProps> = ({ item, onClose, onAction }) => {
  const [userName, setUserName] = useState(item.currentHolder || '');
  const [projectName, setProjectName] = useState(item.projectName || '');
  const [notes, setNotes] = useState('');
  const [isTransmitting, setIsTransmitting] = useState(false);
  const isDeploying = item.status === EquipmentStatus.AVAILABLE;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || isTransmitting) return;

    setIsTransmitting(true);
    const updatedItem: Equipment = {
      ...item,
      status: isDeploying ? EquipmentStatus.IN_USE : EquipmentStatus.AVAILABLE,
      currentHolder: isDeploying ? userName : undefined,
      projectName: isDeploying ? projectName : undefined,
    };

    try {
      await onAction(updatedItem, userName, isDeploying ? projectName : undefined, notes);
    } catch (e) {
      setIsTransmitting(false);
    }
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
            <button onClick={onClose} disabled={isTransmitting} className="w-10 h-10 flex items-center justify-center bg-white/20 backdrop-blur-xl rounded-2xl text-white hover:bg-white hover:text-slate-900 transition-all border border-white/30 disabled:opacity-50">
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
            <div className="text-xs font-black text-slate-400 uppercase tracking-widest">Operation Status</div>
            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 ${
              isDeploying ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-green-50 text-green-600 border-green-100'
            }`}>
              {isDeploying ? 'READY TO DEPLOY' : 'OUT ON SITE'}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                {isDeploying ? 'ASSIGN TO OPERATOR' : 'RETURNED BY'}
              </label>
              <input
                type="text"
                required
                disabled={isTransmitting}
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:bg-white outline-none transition-all font-bold text-slate-900 disabled:opacity-50"
                placeholder="Staff name..."
              />
            </div>

            {isDeploying && (
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                  WORK LOCATION / PROJECT
                </label>
                <input
                  type="text"
                  required
                  disabled={isTransmitting}
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:bg-white outline-none transition-all font-bold text-slate-900 disabled:opacity-50"
                  placeholder="Site ID or Project Name"
                />
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                REMARKS / NOTES
              </label>
              <textarea
                disabled={isTransmitting}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:bg-white outline-none transition-all h-20 resize-none font-medium text-slate-600 text-sm disabled:opacity-50"
                placeholder="Physical condition or notes..."
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isTransmitting}
            className={`w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] text-white shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 ${
              isTransmitting ? 'bg-slate-400' : isDeploying ? 'bg-orange-600 hover:bg-orange-700 shadow-orange-100' : 'bg-slate-900 hover:bg-slate-800 shadow-slate-200'
            }`}
          >
            {isTransmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                SYNCING LOGISTICS...
              </>
            ) : (
              isDeploying ? 'พร้อมใช้งาน' : 'รอนำส่งคืน'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EquipmentActionModal;
