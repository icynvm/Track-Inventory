
import React, { useState, useRef } from 'react';
import { Equipment, EquipmentStatus } from '../types';

interface EquipmentFormModalProps {
  item?: Equipment; // If provided, we are in edit mode
  onClose: () => void;
  onSave: (item: Equipment) => void;
}

const EquipmentFormModal: React.FC<EquipmentFormModalProps> = ({ item, onClose, onSave }) => {
  const [name, setName] = useState(item?.name || '');
  const [category, setCategory] = useState(item?.category || '');
  const [imageUrl, setImageUrl] = useState(item?.imageUrl || '');
  const [customId, setCustomId] = useState(item?.id || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEdit = !!item;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = customId || `EQ-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const newItem: Equipment = {
      ...(item || {}),
      id,
      name,
      category,
      imageUrl: imageUrl.trim() || undefined,
      status: item?.status || EquipmentStatus.AVAILABLE,
      lastActionDate: new Date().toISOString()
    };
    onSave(newItem);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden transform animate-in zoom-in duration-300">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">
              {isEdit ? 'Edit Asset' : 'New Asset'}
            </h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Inventory Management</p>
          </div>
          <button onClick={onClose} className="w-12 h-12 flex items-center justify-center bg-slate-100 rounded-2xl text-slate-500 hover:text-slate-900 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[85vh] overflow-y-auto custom-scrollbar">
          {/* LARGE Image Upload Section */}
          <div className="flex flex-col items-center gap-4">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative group cursor-pointer w-full aspect-video md:aspect-[21/9] rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden transition-all hover:border-blue-400"
            >
              {imageUrl ? (
                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center space-y-2">
                  <div className="mx-auto w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-400">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Upload Asset Photo</p>
                </div>
              )}
              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                 <span className="text-white text-xs font-black uppercase tracking-[0.2em] bg-slate-900/60 px-6 py-3 rounded-xl backdrop-blur-md border border-white/20">Change Image</span>
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Equipment Name</label>
              <input 
                type="text" 
                required 
                value={name} 
                onChange={e => setName(e.target.value)} 
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:bg-white outline-none transition-all font-bold text-slate-900" 
                placeholder="e.g. Arri Alexa Mini" 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Category</label>
                <input 
                  type="text" 
                  required 
                  value={category} 
                  onChange={e => setCategory(e.target.value)} 
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:bg-white outline-none transition-all font-bold text-slate-900" 
                  placeholder="e.g. Camera" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Asset ID / Barcode</label>
                <input 
                  type="text" 
                  value={customId} 
                  onChange={e => setCustomId(e.target.value)} 
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:bg-white outline-none transition-all font-mono font-bold text-blue-600" 
                  placeholder="EQ-XXXX"
                  disabled={isEdit}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex flex-col md:flex-row gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="order-2 md:order-1 flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-xs uppercase tracking-widest rounded-2xl transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="order-1 md:order-2 flex-[2] py-4 bg-slate-900 hover:bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-slate-200"
            >
              {isEdit ? 'Update Database' : 'Register Asset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EquipmentFormModal;
