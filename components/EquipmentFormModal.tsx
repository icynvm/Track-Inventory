
import React, { useState, useRef, useEffect } from 'react';
import { Equipment, EquipmentStatus } from '../types';

interface EquipmentFormModalProps {
  item?: Equipment;
  onClose: () => void;
  onSave: (item: Equipment) => Promise<void>; 
}

const EquipmentFormModal: React.FC<EquipmentFormModalProps> = ({ item, onClose, onSave }) => {
  const [name, setName] = useState(item?.name || '');
  const [category, setCategory] = useState(item?.category || '');
  const [imageUrl, setImageUrl] = useState(item?.imageUrl || '');
  const [customId, setCustomId] = useState(item?.id || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEdit = !!item;

  useEffect(() => {
    if (item) {
      setName(item.name);
      setCategory(item.category);
      setImageUrl(item.imageUrl || '');
      setCustomId(item.id);
    }
  }, [item]);

  const compressImage = (base64: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 320;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve(base64); return; }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.5);
        resolve(compressedBase64);
      };
      img.onerror = () => resolve(base64);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsCompressing(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const compressed = await compressImage(reader.result as string);
        setImageUrl(compressed);
        setIsCompressing(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImageUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isCompressing) return;
    setIsSubmitting(true);
    const id = customId || `EQ-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const newItem: Equipment = {
      ...(item || {}),
      id,
      name,
      category: category.toUpperCase().trim(),
      imageUrl: imageUrl.trim() || undefined,
      status: item?.status || EquipmentStatus.AVAILABLE,
      lastActionDate: new Date().toISOString()
    };
    try { await onSave(newItem); } catch (err) { console.error(err); } finally { setIsSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 backdrop-blur-xl p-4 animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-white/10 rounded-[3rem] shadow-2xl w-full max-w-xl overflow-hidden transform animate-in zoom-in duration-300">
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
          <div>
            <h2 className="text-2xl font-extrabold text-white tracking-tighter uppercase">
              {isEdit ? 'MODIFY_ASSET' : 'REGISTRATION'}
            </h2>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Matrix Identity Protocol</p>
          </div>
          <button onClick={onClose} disabled={isSubmitting} className="w-12 h-12 flex items-center justify-center glass rounded-2xl text-slate-400 hover:text-white transition-all disabled:opacity-50">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
          <div 
            onClick={() => !isSubmitting && !isCompressing && fileInputRef.current?.click()}
            className={`relative group cursor-pointer w-full aspect-video rounded-3xl bg-slate-950 border-2 border-dashed border-white/5 flex items-center justify-center overflow-hidden transition-all ${!isSubmitting && !isCompressing ? 'hover:border-white/20' : 'opacity-50'}`}
          >
            {isCompressing ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
                <p className="text-[10px] font-extrabold text-slate-600 uppercase tracking-widest">ENCODING_MEDIA...</p>
              </div>
            ) : imageUrl ? (
              <>
                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover brightness-90" />
                <button type="button" onClick={removeImage} className="absolute top-4 right-4 z-20 p-2 bg-red-600/80 backdrop-blur-md text-white rounded-xl shadow-2xl transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
              </>
            ) : (
              <div className="text-center space-y-3">
                <div className="mx-auto w-14 h-14 glass rounded-2xl flex items-center justify-center text-slate-600">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <p className="text-[10px] font-extrabold text-slate-600 uppercase tracking-widest">OPTICAL_LINK_IMAGE</p>
              </div>
            )}
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.3em] mb-2">IDENTIFIER_NAME</label>
              <input 
                type="text" required disabled={isSubmitting} value={name} onChange={e => setName(e.target.value)} 
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-white/30 outline-none transition-all font-bold text-white placeholder-slate-800 disabled:opacity-50" 
                placeholder="LABEL ASSET" 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.3em] mb-2">CATEGORY_CLASS</label>
                <input 
                  type="text" required disabled={isSubmitting} value={category} onChange={e => setCategory(e.target.value)} 
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-white/30 outline-none transition-all font-bold text-white placeholder-slate-800 uppercase" 
                  placeholder="e.g. VISUAL_CORE" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.3em] mb-2">ASSET_UID</label>
                <input 
                  type="text" disabled={isEdit || isSubmitting} value={customId} onChange={e => setCustomId(e.target.value)} 
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl font-mono font-bold text-orange-500 disabled:opacity-50" 
                  placeholder="AUTO_GEN"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col md:flex-row gap-4">
            <button type="button" onClick={onClose} className="order-2 md:order-1 flex-1 py-4 glass text-slate-500 hover:text-white rounded-2xl font-extrabold text-[11px] uppercase tracking-widest transition-all">ABORT</button>
            <button type="submit" disabled={isSubmitting || isCompressing} className="order-1 md:order-2 flex-[2] py-4 bg-white hover:bg-slate-200 text-slate-950 rounded-2xl font-extrabold text-[11px] uppercase tracking-widest transition-all shadow-xl shadow-white/5 flex items-center justify-center gap-3">
              {isSubmitting ? 'SYNCING...' : isEdit ? 'UPDATE_MATRIX' : 'REGISTER_DEPOT'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EquipmentFormModal;
