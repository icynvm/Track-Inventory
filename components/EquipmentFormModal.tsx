
import React, { useState, useRef, useEffect } from 'react';
import { Equipment, EquipmentStatus } from '../types';

interface EquipmentFormModalProps {
  item?: Equipment; // If provided, we are in edit mode
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

  /**
   * FIX: High-res images are too big for Google Sheet cells.
   * This compressor ensures they fit by forcing them into a small JPG.
   */
  const compressImage = (base64: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 320; // Enough for a clear thumbnail, stays small
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;

        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve(base64); return; }
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Force to JPEG at 0.5 quality to significantly reduce string length
        // This keeps the base64 string usually under 20-30k chars
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
        const rawBase64 = reader.result as string;
        const compressed = await compressImage(rawBase64);
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
    
    try {
      await onSave(newItem);
    } catch (err) {
      console.error("Save failure:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden transform animate-in zoom-in duration-300">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">
              {isEdit ? 'Modify Asset' : 'New Registration'}
            </h2>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Matrix Inventory Link</p>
          </div>
          <button onClick={onClose} disabled={isSubmitting} className="w-12 h-12 flex items-center justify-center bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 transition-all shadow-sm disabled:opacity-50">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[85vh] overflow-y-auto custom-scrollbar">
          <div className="flex flex-col items-center gap-4">
            <div 
              onClick={() => !isSubmitting && !isCompressing && fileInputRef.current?.click()}
              className={`relative group cursor-pointer w-full aspect-video md:aspect-[21/9] rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden transition-all ${!isSubmitting && !isCompressing ? 'hover:border-blue-400 hover:bg-white' : 'opacity-50 cursor-not-allowed'}`}
            >
              {isCompressing ? (
                 <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compressing Media...</p>
                 </div>
              ) : imageUrl ? (
                <>
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={removeImage}
                    className="absolute top-4 right-4 z-20 p-2 bg-red-600 text-white rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </>
              ) : (
                <div className="text-center space-y-2">
                  <div className="mx-auto w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-400">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Upload Item Photo</p>
                </div>
              )}
              {!isSubmitting && imageUrl && !isCompressing && (
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <span className="text-white text-[10px] font-black uppercase tracking-[0.2em] bg-slate-900/60 px-6 py-3 rounded-xl backdrop-blur-md border border-white/20">Change Photo</span>
                </div>
              )}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Asset Label</label>
              <input 
                type="text" required disabled={isSubmitting} value={name} onChange={e => setName(e.target.value)} 
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:bg-white outline-none transition-all font-bold text-slate-900 disabled:opacity-50" 
                placeholder="Name of Equipment" 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Type / Category</label>
                <input 
                  type="text" required disabled={isSubmitting} value={category} onChange={e => setCategory(e.target.value)} 
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:bg-white outline-none transition-all font-bold text-slate-900 disabled:opacity-50 uppercase" 
                  placeholder="e.g. CAMERA, LIGHTING" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Unique UID</label>
                <input 
                  type="text" disabled={isEdit || isSubmitting} value={customId} onChange={e => setCustomId(e.target.value)} 
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:bg-white outline-none transition-all font-mono font-bold text-blue-600 disabled:opacity-50" 
                  placeholder="EQ-XXXX"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex flex-col md:flex-row gap-3">
            <button 
              type="button" disabled={isSubmitting} onClick={onClose}
              className="order-2 md:order-1 flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all disabled:opacity-50"
            >
              Discard
            </button>
            <button 
              type="submit" disabled={isSubmitting || isCompressing}
              className="order-1 md:order-2 flex-[2] py-4 bg-slate-900 hover:bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-slate-200 disabled:bg-slate-400 flex items-center justify-center gap-3"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  Syncing Cloud...
                </>
              ) : (
                isEdit ? 'Save Changes' : 'Register Asset'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EquipmentFormModal;
