
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

  // Explicitly type accentColors to ensure all AlertType values are valid keys and prevent inference narrowing
  const accentColors: Record<AlertType, string> = {
    info: 'bg-blue-500',
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-orange-500',
    confirm: 'bg-white'
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden transform animate-in zoom-in slide-in-from-bottom-4 duration-500">
        <div className={`h-1.5 ${accentColors[type]} shadow-[0_0_15px_rgba(255,255,255,0.1)]`} />
        <div className="p-10 text-center">
          {/* Use type assertion in comparisons with 'confirm' to avoid incorrect narrowing by the compiler */}
          <div className={`mx-auto w-16 h-16 rounded-2xl mb-8 flex items-center justify-center shadow-2xl ${accentColors[type]} ${(type as string) === 'confirm' ? 'text-slate-950' : 'text-white'}`}>
            {type === 'success' && <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
            {type === 'error' && <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>}
            {(type === 'warning' || (type as string) === 'confirm') && <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
            {type === 'info' && <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          </div>
          <h3 className="text-2xl font-extrabold text-white uppercase tracking-tighter mb-3">{title}</h3>
          <p className="text-slate-500 font-medium text-sm leading-relaxed mb-10">{message}</p>
          
          <div className="flex gap-4">
            {(type as string) === 'confirm' ? (
              <>
                <button onClick={onClose} className="flex-1 py-4 glass text-slate-500 hover:text-white rounded-2xl font-extrabold text-[11px] uppercase tracking-widest transition-all">ABORT</button>
                <button onClick={() => { onConfirm?.(); onClose(); }} className="flex-1 py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-extrabold text-[11px] uppercase tracking-widest transition-all shadow-xl shadow-red-950/20">CONFIRM_WIPE</button>
              </>
            ) : (
              <button onClick={onClose} className={`w-full py-4 rounded-2xl font-extrabold text-[11px] uppercase tracking-widest transition-all shadow-2xl ${accentColors[type]} ${(type as string) === 'confirm' ? 'text-slate-950' : 'text-white shadow-black/40'}`}>ACKNOWLEDGE</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomAlert;
