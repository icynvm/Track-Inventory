
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xl p-4 animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden transform animate-in zoom-in slide-in-from-bottom-10 duration-500">
        <div className="relative h-48 md:h-64 bg-slate-800 overflow-hidden">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover brightness-75" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-700 bg-slate-950">
              <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
          )}
          <div className="absolute top-6 right-6">
            <button onClick={onClose} disabled={isTransmitting} className="w-10 h-10 flex items-center justify-center glass rounded-2xl text-white hover:bg-white hover:text-slate-950 transition-all disabled:opacity-50">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-slate-950 to-transparent">
             <p className="text-[10px] font-extrabold text-orange-500 uppercase tracking-[0.4em] mb-1">{item.category}</p>
             <h2 className="text-2xl font-extrabold text-white tracking-tighter uppercase">{item.name}</h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 shadow-inner">
            <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">DEPLOY_STATE</div>
            <div className={`px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest border ${
              isDeploying ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
            }`}>
              {isDeploying ? 'พร้อมใช้งาน' : 'กำลังใช้งานอยู่'}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.3em] mb-2">
                {isDeploying ? 'ชื่อผู้เบิกใช้งาน' : 'ผู้ส่งคืนครุภัณฑ์'}
              </label>
              <input
                type="text"
                required
                disabled={isTransmitting}
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/30 outline-none transition-all font-bold text-white placeholder-slate-700 disabled:opacity-50"
                placeholder="ระบุชื่อเจ้าหน้าที่..."
              />
            </div>

            {isDeploying && (
              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.3em] mb-2">
                  สถานที่ใช้งาน / โปรเจกต์
                </label>
                <input
                  type="text"
                  required
                  disabled={isTransmitting}
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/30 outline-none transition-all font-bold text-white placeholder-slate-700 disabled:opacity-50"
                  placeholder="SITE_ID or PROJECT_NAME"
                />
              </div>
            )}

            <div>
              <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.3em] mb-2">
                REMARKS / หมายเหตุ
              </label>
              <textarea
                disabled={isTransmitting}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-5 py-3 bg-white/5 border border-white/10 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/30 outline-none transition-all h-24 resize-none font-medium text-slate-400 text-sm placeholder-slate-700 disabled:opacity-50"
                placeholder="ระบุสภาพเครื่อง หรือ รายละเอียดเพิ่มเติม..."
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isTransmitting}
            className={`w-full py-5 rounded-2xl font-extrabold text-[11px] uppercase tracking-[0.2em] text-white shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-4 ${
              isTransmitting ? 'bg-slate-700' : isDeploying ? 'bg-orange-600 hover:bg-orange-500 shadow-orange-950' : 'bg-white hover:bg-slate-200 text-slate-950 shadow-white/10'
            }`}
          >
            {isTransmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                TRANSMITTING DATA...
              </>
            ) : (
              isDeploying ? 'พร้อมเบิกใช้งาน' : 'นำส่งคืนของ'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EquipmentActionModal;
