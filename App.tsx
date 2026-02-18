
import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Equipment, EquipmentStatus, AuditLog } from './types';
import { storageService } from './services/storageService';
import Scanner from './components/Scanner';
import EquipmentActionModal from './components/EquipmentActionModal';
import EquipmentFormModal from './components/EquipmentFormModal';

// --- Types for Auth ---
type UserRole = 'admin' | 'user';

// --- Login Screen ---

const LoginPage: React.FC<{ onLogin: (role: UserRole) => void }> = ({ onLogin }) => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
    <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-700">
      <div className="text-center space-y-4">
        <div className="mx-auto w-20 h-20 bg-slate-900 p-5 rounded-[2rem] shadow-2xl flex items-center justify-center text-white">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
          </svg>
        </div>
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">EquipTrack<span className="text-blue-600">Pro</span></h1>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-[0.2em]">Asset Intelligence Terminal</p>
        </div>
      </div>

      <div className="space-y-4">
        <button 
          onClick={() => onLogin('user')}
          className="group relative w-full p-8 bg-white border-2 border-slate-100 rounded-[2.5rem] shadow-sm hover:border-blue-500 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center gap-4"
        >
          <div className="w-14 h-14 bg-slate-50 group-hover:bg-blue-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </div>
          <div>
            <span className="block text-lg font-black text-slate-900 tracking-tight">Production Crew</span>
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Check-in / Check-out</span>
          </div>
        </button>

        <button 
          onClick={() => onLogin('admin')}
          className="group relative w-full p-8 bg-white border-2 border-slate-100 rounded-[2.5rem] shadow-sm hover:border-slate-900 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center gap-4"
        >
          <div className="w-14 h-14 bg-slate-50 group-hover:bg-slate-900 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-white transition-colors">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </div>
          <div>
            <span className="block text-lg font-black text-slate-900 tracking-tight">Asset Manager</span>
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Full Database Control</span>
          </div>
        </button>
      </div>

      <p className="text-center text-[10px] text-slate-300 font-bold uppercase tracking-widest">EquipTrack Systems v3.4.1</p>
    </div>
  </div>
);

// --- Sub-components ---

const StatCard: React.FC<{ label: string; value: number; color: string; icon: React.ReactNode }> = ({ label, value, color, icon }) => (
  <div className="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
    <div className={`p-4 rounded-2xl ${color}`}>
      {icon}
    </div>
    <div className="overflow-hidden">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{label}</p>
      <p className="text-2xl font-black text-slate-900">{value}</p>
    </div>
  </div>
);

const EquipmentCard: React.FC<{
  item: Equipment;
  onSelect: (item: Equipment) => void;
  onViewQR: (item: Equipment) => void;
  onEdit: (item: Equipment) => void;
  isAdmin: boolean;
}> = ({ item, onSelect, onViewQR, onEdit, isAdmin }) => {
  const statusColors = {
    [EquipmentStatus.AVAILABLE]: 'bg-green-100 text-green-700',
    [EquipmentStatus.IN_USE]: 'bg-blue-100 text-blue-700',
    [EquipmentStatus.MAINTENANCE]: 'bg-orange-100 text-orange-700',
    [EquipmentStatus.LOST]: 'bg-red-100 text-red-700',
  };

  return (
    <div className="bg-white p-5 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col gap-5 active:bg-slate-50 transition-all hover:shadow-xl hover:-translate-y-1" onClick={() => onSelect(item)}>
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex-shrink-0 overflow-hidden border border-slate-200 shadow-inner">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-200">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4" /></svg>
            </div>
          )}
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="flex items-center justify-between gap-2">
            <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${statusColors[item.status]}`}>
              {item.status.replace('_', ' ')}
            </span>
            <div className="flex gap-1">
              <button onClick={(e) => { e.stopPropagation(); onViewQR(item); }} className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 rounded-xl transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01" /></svg></button>
              {isAdmin && (
                <button onClick={(e) => { e.stopPropagation(); onEdit(item); }} className="p-2 text-slate-400 hover:text-orange-600 bg-slate-50 rounded-xl transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
              )}
            </div>
          </div>
          <h3 className="font-black text-slate-900 tracking-tight truncate mt-1">{item.name}</h3>
          <p className="text-[10px] text-slate-400 font-mono font-black uppercase tracking-widest">{item.id}</p>
        </div>
      </div>
      
      <div className="flex items-center justify-between text-[10px] pt-4 border-t border-slate-50 font-black tracking-widest uppercase">
        <div className="text-slate-400">{item.category}</div>
        <div className="text-right">
          {item.currentHolder ? (
            <div className="text-blue-600 truncate max-w-[100px]">{item.currentHolder}</div>
          ) : (
            <div className="text-slate-200">Free</div>
          )}
        </div>
      </div>
      {item.projectName && (
        <div className="bg-blue-600 text-white px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest self-start shadow-lg shadow-blue-100">
          @{item.projectName}
        </div>
      )}
    </div>
  );
};

// --- QR Modal ---

const QRCodeModal: React.FC<{ item: Equipment; onClose: () => void }> = ({ item, onClose }) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-2xl p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-sm overflow-hidden transform animate-in zoom-in duration-300">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Label</h2>
          <button onClick={onClose} className="w-12 h-12 flex items-center justify-center bg-slate-100 rounded-2xl text-slate-500 hover:text-slate-900 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-10 flex flex-col items-center">
          <div className="bg-white p-6 rounded-[2rem] shadow-2xl border border-slate-50 mb-8 flex items-center justify-center">
            <QRCodeSVG value={item.id} size={220} level="H" includeMargin={true} />
          </div>
          <div className="text-center space-y-2">
            <p className="text-[10px] text-blue-600 font-black uppercase tracking-[0.3em]">{item.category}</p>
            <p className="font-black text-2xl text-slate-900 tracking-tighter uppercase">{item.name}</p>
            <p className="text-slate-400 font-mono font-bold text-sm tracking-[0.3em]">{item.id}</p>
          </div>
          <button 
            onClick={() => window.print()}
            className="mt-10 w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 active:scale-95 transition-transform shadow-2xl shadow-slate-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            Generate Print
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Dashboard ---

const DashboardPage: React.FC<{ 
  items: Equipment[]; 
  logs: AuditLog[]; 
  onSelectItem: (item: Equipment) => void;
  onAddEquipment: () => void;
  onEditEquipment: (item: Equipment) => void;
  onViewQR: (item: Equipment) => void;
  role: UserRole;
}> = ({ items, logs, onSelectItem, onAddEquipment, onEditEquipment, onViewQR, role }) => {
  const isAdmin = role === 'admin';
  const stats = useMemo(() => ({
    total: items.length,
    available: items.filter(i => i.status === EquipmentStatus.AVAILABLE).length,
    inUse: items.filter(i => i.status === EquipmentStatus.IN_USE).length,
    maintenance: items.filter(i => i.status === EquipmentStatus.MAINTENANCE).length,
  }), [items]);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <span className="px-3 py-1 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg">{role} mode</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase leading-none">Inventory</h1>
          <p className="text-slate-400 font-bold text-sm md:text-base uppercase tracking-widest">Active Production Pipeline Assets</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          {isAdmin && (
            <button 
              onClick={onAddEquipment}
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-100 font-black py-4 px-8 rounded-2xl transition-all active:scale-95 text-[10px] uppercase tracking-widest shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
              </svg>
              New Asset
            </button>
          )}
          <Link 
            to="/scan" 
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-8 rounded-2xl shadow-xl shadow-blue-200 transition-all active:scale-95 text-[10px] uppercase tracking-widest"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01" /></svg>
            Scan Check
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Gear" value={stats.total} color="bg-slate-100 text-slate-600" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>} />
        <StatCard label="Ready" value={stats.available} color="bg-green-50 text-green-600" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        <StatCard label="On Set" value={stats.inUse} color="bg-blue-50 text-blue-600" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>} />
        <StatCard label="Repair" value={stats.maintenance} color="bg-orange-50 text-orange-600" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10 pb-24 md:pb-12">
        <div className="xl:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-black text-2xl text-slate-900 tracking-tighter uppercase">Asset Matrix</h2>
            <div className="text-[10px] font-black text-slate-400 bg-slate-100 px-4 py-1.5 rounded-full uppercase tracking-widest">{items.length} units detected</div>
          </div>
          
          {/* Mobile View: High Quality Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map(item => (
              <EquipmentCard 
                key={item.id} 
                item={item} 
                onSelect={onSelectItem} 
                onViewQR={onViewQR} 
                onEdit={onEditEquipment} 
                isAdmin={isAdmin}
              />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 flex flex-col h-[600px] md:h-[800px] sticky top-28">
          <div className="p-8 border-b border-slate-50">
            <h2 className="font-black text-2xl text-slate-900 tracking-tighter uppercase">Telemetry Logs</h2>
          </div>
          <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar">
            {logs.length === 0 ? (
              <div className="text-center py-32 text-slate-300 italic flex flex-col items-center gap-6">
                 <svg className="w-20 h-20 text-slate-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                 <p className="text-xs font-black uppercase tracking-[0.3em]">No Transmission Data</p>
              </div>
            ) : (
              logs.map(log => (
                <div key={log.id} className="flex gap-5 group">
                  <div className={`mt-1 flex-shrink-0 w-12 h-12 rounded-[1.25rem] flex items-center justify-center transition-all group-hover:scale-110 shadow-lg ${
                    log.action === 'CHECK_OUT' ? 'bg-blue-600 text-white shadow-blue-100' : 'bg-slate-900 text-white shadow-slate-100'
                  }`}>
                    {log.action === 'CHECK_OUT' ? 
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 16l4-4m0 0l-4-4m4 4H7" /></svg> : 
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M11 16l-4-4m0 0l4-4m-4 4h14" /></svg>
                    }
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm leading-tight mb-2">
                      <span className="font-black text-slate-900 uppercase tracking-tight">{log.userName}</span> 
                      <span className="text-slate-400 font-bold"> {log.action === 'CHECK_OUT' ? 'deployed' : 'restored'} </span>
                      <span className="font-black text-blue-600 block truncate">{log.equipmentName}</span>
                    </p>
                    {log.projectName && (
                      <div className="inline-flex items-center gap-2 bg-slate-50 text-slate-500 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border border-slate-100">
                        <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M7 7h.01M7 3h5l7 7-7 7H7a4 4 0 01-4-4V7a4 4 0 014-4z" /></svg>
                        {log.projectName}
                      </div>
                    )}
                    <p className="text-[9px] text-slate-300 mt-3 uppercase font-black tracking-widest">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(log.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ScanPage: React.FC<{ onScan: (id: string) => void }> = ({ onScan }) => (
  <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-12 animate-in fade-in duration-700 px-4">
    <div className="text-center max-w-lg space-y-4">
      <div className="mx-auto w-16 h-16 bg-blue-600 text-white rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-blue-200">
         <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01" /></svg>
      </div>
      <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase leading-none">Ready Lens</h1>
      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs md:text-sm">Position barcode or QR inside frame</p>
    </div>
    <div className="w-full max-w-sm">
      <Scanner onScanSuccess={onScan} isActive={true} />
    </div>
    <Link to="/" className="text-slate-400 hover:text-slate-900 flex items-center gap-3 transition-colors font-black text-xs uppercase tracking-[0.2em] bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
      Abort Mission
    </Link>
  </div>
);

// --- Main App ---

const AppContent: React.FC = () => {
  const [items, setItems] = useState<Equipment[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [selectedItem, setSelectedItem] = useState<Equipment | null>(null);
  const [isAddingEquipment, setIsAddingEquipment] = useState(false);
  const [editingItem, setEditingItem] = useState<Equipment | null>(null);
  const [viewingQRItem, setViewingQRItem] = useState<Equipment | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setItems(storageService.getItems());
    setLogs(storageService.getLogs());
    
    // Check for saved session
    const savedRole = localStorage.getItem('equiptrack_role') as UserRole;
    if (savedRole) setRole(savedRole);
  }, []);

  const handleLogin = (selectedRole: UserRole) => {
    setRole(selectedRole);
    localStorage.setItem('equiptrack_role', selectedRole);
  };

  const handleLogout = () => {
    setRole(null);
    localStorage.removeItem('equiptrack_role');
  };

  const handleScanSuccess = (id: string) => {
    const item = storageService.getItemById(id);
    if (item) {
      setSelectedItem(item);
      navigate('/');
    } else {
      alert(`Asset ID ${id} not found in database.`);
    }
  };

  const handleSaveEquipment = (newItem: Equipment) => {
    if (editingItem) {
      storageService.updateItem(newItem);
    } else {
      storageService.addItem(newItem);
    }
    setItems(storageService.getItems());
    setIsAddingEquipment(false);
    setEditingItem(null);
    if (!editingItem) {
      setViewingQRItem(newItem);
    }
  };

  const handleAction = (updatedItem: Equipment, userName: string, projectName?: string, notes?: string) => {
    const isCheckOut = updatedItem.status === EquipmentStatus.IN_USE;
    storageService.updateItem(updatedItem);
    storageService.addLog({
      equipmentId: updatedItem.id,
      equipmentName: updatedItem.name,
      action: isCheckOut ? 'CHECK_OUT' : 'CHECK_IN',
      userName,
      projectName,
      notes
    });
    setItems(storageService.getItems());
    setLogs(storageService.getLogs());
    setSelectedItem(null);
  };

  if (!role) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen pb-32 md:pb-16 bg-[#fbfcfd]">
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-3xl border-b border-slate-100 px-6 py-5 mb-8 md:mb-14">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-4 group">
            <div className="bg-slate-900 p-3 rounded-[1.25rem] shadow-2xl shadow-slate-200 group-hover:rotate-6 transition-transform">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
              </svg>
            </div>
            <div className="leading-none">
              <span className="text-2xl font-black text-slate-900 tracking-tighter uppercase">EquipTrack</span>
              <div className="text-[10px] font-black text-blue-600 tracking-[0.4em] uppercase mt-1">Matrix Pro</div>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-10">
            <Link to="/" className={`text-xs font-black tracking-widest transition-colors ${location.pathname === '/' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-900'}`}>DASHBOARD</Link>
            <Link to="/scan" className={`text-xs font-black tracking-widest transition-colors ${location.pathname === '/scan' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-900'}`}>LENS SCAN</Link>
            <div className="h-4 w-[2px] bg-slate-100"></div>
            <button onClick={handleLogout} className="flex items-center gap-3 bg-slate-50 pl-2 pr-5 py-1.5 rounded-full border border-slate-100 hover:bg-red-50 hover:border-red-100 transition-all group">
              <div className="w-8 h-8 rounded-full bg-slate-900 group-hover:bg-red-600 flex items-center justify-center text-white text-[10px] font-black transition-colors">{role[0].toUpperCase()}</div>
              <span className="text-[10px] font-black text-slate-900 tracking-widest uppercase">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6">
        <Routes>
          <Route path="/" element={
            <DashboardPage 
              items={items} 
              logs={logs} 
              onSelectItem={setSelectedItem} 
              onAddEquipment={() => setIsAddingEquipment(true)} 
              onEditEquipment={setEditingItem}
              onViewQR={setViewingQRItem}
              role={role}
            />
          } />
          <Route path="/scan" element={<ScanPage onScan={handleScanSuccess} />} />
        </Routes>
      </main>

      {/* Modern Floating Bottom Navigation for Mobile */}
      <div className="md:hidden fixed bottom-10 left-8 right-8 z-50">
        <div className="bg-slate-900/95 backdrop-blur-2xl border border-white/10 p-2.5 rounded-[2.5rem] shadow-2xl flex justify-around items-center">
          <Link to="/" className={`p-5 rounded-[1.75rem] transition-all ${location.pathname === '/' ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/40' : 'text-slate-500'}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          </Link>
          <Link to="/scan" className="relative -mt-14 bg-white p-6 rounded-full shadow-2xl shadow-blue-400 border-[6px] border-slate-900 active:scale-90 transition-transform">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01" /></svg>
          </Link>
          {role === 'admin' ? (
            <button onClick={() => setIsAddingEquipment(true)} className="p-5 rounded-[1.75rem] text-slate-500 active:text-white transition-all">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
            </button>
          ) : (
            <button onClick={handleLogout} className="p-5 rounded-[1.75rem] text-slate-500 active:text-red-500 transition-all">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 16l4-4m0 0l-4-4m4 4H7" /></svg>
            </button>
          )}
        </div>
      </div>

      {selectedItem && (
        <EquipmentActionModal 
          item={selectedItem} 
          onClose={() => setSelectedItem(null)} 
          onAction={handleAction} 
        />
      )}

      {(isAddingEquipment || editingItem) && (
        <EquipmentFormModal 
          item={editingItem || undefined}
          onClose={() => { setIsAddingEquipment(false); setEditingItem(null); }} 
          onSave={handleSaveEquipment} 
        />
      )}

      {viewingQRItem && <QRCodeModal item={viewingQRItem} onClose={() => setViewingQRItem(null)} />}
    </div>
  );
};

const App: React.FC = () => (
  <HashRouter>
    <AppContent />
  </HashRouter>
);

export default App;
