
import React from 'react';

export type AlertType = 'info' | 'success' | 'error' | 'warning' | 'confirm';

interface CustomAlertProps {
  isOpen: boolean;
  type: AlertType;
  title: string;
  message: string;
  onClose: () => void;
  onConfirm?: () => void;
}

const CustomAlert: React.FC<CustomAlertProps> = ({ isOpen, type, title, message, onClose, onConfirm }) => {
  if (!isOpen) return null;

  const colors = {
    info: 'bg-blue-600',
    success: 'bg-green-600',
    error: 'bg-red-600',
    warning: 'bg-orange-600',
    confirm: 'bg-slate-900'
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden transform animate-in zoom-in slide-in-from-bottom-4 duration-300">
        <div className={`h-2 ${colors[type]}`} />
        <div className="p-8 text-center">
          <div className={`mx-auto w-16 h-16 rounded-2xl mb-6 flex items-center justify-center text-white ${colors[type]}`}>
            {type === 'success' && <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
            {type === 'error' && <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>}
            {(type === 'warning' || type === 'confirm') && <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
            {type === 'info' && <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          </div>
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-2">{title}</h3>
          <p className="text-slate-500 font-bold text-sm leading-relaxed mb-8">{message}</p>
          
          <div className="flex gap-3">
            {type === 'confirm' ? (
              <>
                <button onClick={onClose} className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">Cancel</button>
                <button onClick={() => { onConfirm?.(); onClose(); }} className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-red-100">Delete</button>
              </>
            ) : (
              <button onClick={onClose} className={`w-full py-4 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl ${colors[type]}`}>Understood</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomAlert;
