
import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Equipment, EquipmentStatus, AuditLog } from './types';
import { storageService } from './services/storageService';
import Scanner from './components/Scanner';
import EquipmentActionModal from './components/EquipmentActionModal';
import EquipmentFormModal from './components/EquipmentFormModal';
import SettingsModal from './components/SettingsModal';
import CustomAlert, { AlertType } from './components/CustomAlert';

type UserRole = 'admin' | 'user';

const LOGO_URL = 'https://img2.pic.in.th/7289a7bc-643b-4c94-96a8-9a8826277950.png';

const ScanIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7V5a2 2 0 0 1 2-2h2" />
    <path d="M17 3h2a2 2 0 0 1 2 2v2" />
    <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
    <path d="M3 17v2a2 2 0 0 0 2 2h2" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

// --- Login Screen ---
const LoginPage: React.FC<{ onLogin: (role: UserRole) => void }> = ({ onLogin }) => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-6 overflow-hidden">
    <div className="w-full max-w-md space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-700">
      <div className="text-center space-y-6">
        <div className="mx-auto w-24 h-24 bg-slate-900 p-3 rounded-[2.5rem] shadow-2xl flex items-center justify-center overflow-hidden border border-white/5 shadow-blue-500/10">
          <img src={LOGO_URL} alt="Logo" className="w-full h-full object-contain brightness-110" />
        </div>
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold text-white tracking-tighter uppercase">EquipTrack<span className="text-orange-500">Pro</span></h1>
          <p className="text-slate-500 text-sm font-medium uppercase tracking-[0.3em]">Fleet Management Terminal</p>
        </div>
      </div>
      <div className="space-y-4">
        <button onClick={() => onLogin('user')} className="group relative w-full p-8 bg-slate-900/50 border border-white/5 rounded-[2.5rem] hover:border-orange-500/50 hover:bg-slate-900 transition-all duration-500 flex flex-col items-center text-center gap-4 shadow-2xl">
          <div className="w-14 h-14 bg-slate-800 group-hover:bg-orange-500 group-hover:text-white rounded-2xl flex items-center justify-center text-slate-400 transition-all duration-500">
            <ScanIcon />
          </div>
          <div>
            <span className="block text-lg font-bold text-white tracking-tight">Production Crew</span>
            <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Instant Deployment</span>
          </div>
        </button>
        <button onClick={() => onLogin('admin')} className="group relative w-full p-8 bg-slate-900/50 border border-white/5 rounded-[2.5rem] hover:border-white/20 hover:bg-slate-900 transition-all duration-500 flex flex-col items-center text-center gap-4 shadow-2xl">
          <div className="w-14 h-14 bg-slate-800 group-hover:bg-white group-hover:text-slate-950 rounded-2xl flex items-center justify-center text-slate-400 transition-all duration-500">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </div>
          <div>
            <span className="block text-lg font-bold text-white tracking-tight">Asset Manager</span>
            <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Full System Control</span>
          </div>
        </button>
      </div>
    </div>
  </div>
);

// --- Sub-components ---
const StatCard: React.FC<{ label: string; value: number; color: string; icon: React.ReactNode }> = ({ label, value, color, icon }) => (
  <div className="glass p-5 rounded-[2rem] border border-white/5 flex items-center gap-5 w-full shadow-2xl shadow-black">
    <div className={`p-4 rounded-2xl flex-shrink-0 ${color} shadow-lg shadow-black/40`}>{icon}</div>
    <div className="overflow-hidden">
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate">{label}</p>
      <p className="text-xl md:text-3xl font-extrabold text-white leading-tight">{value}</p>
    </div>
  </div>
);

const EquipmentCard: React.FC<{ item: Equipment; onSelect: (item: Equipment) => void; onViewQR: (item: Equipment) => void; onEdit: (item: Equipment) => void; onDelete: (item: Equipment) => void; isAdmin: boolean; }> = ({ item, onSelect, onViewQR, onEdit, onDelete, isAdmin }) => {
  const statusColors = { 
    [EquipmentStatus.AVAILABLE]: 'bg-green-500/10 text-green-400 border-green-500/20', 
    [EquipmentStatus.IN_USE]: 'bg-orange-500/10 text-orange-400 border-orange-500/20', 
    [EquipmentStatus.MAINTENANCE]: 'bg-slate-500/10 text-slate-400 border-slate-500/20', 
    [EquipmentStatus.LOST]: 'bg-red-500/10 text-red-400 border-red-500/20' 
  };

  const statusLabel = {
    [EquipmentStatus.AVAILABLE]: 'พร้อมใช้งาน',
    [EquipmentStatus.IN_USE]: 'กำลังใช้งานอยู่',
    [EquipmentStatus.MAINTENANCE]: 'กำลังซ่อมแซม',
    [EquipmentStatus.LOST]: 'สูญหาย'
  };

  return (
    <div className="glass p-5 rounded-[2.5rem] border border-white/5 flex flex-col gap-5 active:bg-slate-900 transition-all hover:border-white/10 w-full group shadow-lg" onClick={() => onSelect(item)}>
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-slate-900 rounded-2xl flex-shrink-0 overflow-hidden border border-white/5 shadow-inner">
          {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" /> : <div className="w-full h-full flex items-center justify-center text-slate-700"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4" /></svg></div>}
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="flex items-center justify-between gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${statusColors[item.status]}`}>
              {statusLabel[item.status]}
            </span>
            <div className="flex gap-1">
              <button onClick={(e) => { e.stopPropagation(); onViewQR(item); }} className="p-2 text-slate-500 hover:text-white bg-slate-900 rounded-xl transition-colors border border-white/5"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01" /></svg></button>
              {isAdmin && (
                <>
                  <button onClick={(e) => { e.stopPropagation(); onEdit(item); }} className="p-2 text-slate-500 hover:text-orange-400 bg-slate-900 rounded-xl transition-colors border border-white/5"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                  <button onClick={(e) => { e.stopPropagation(); onDelete(item); }} className="p-2 text-slate-500 hover:text-red-400 bg-slate-900 rounded-xl transition-colors border border-white/5"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                </>
              )}
            </div>
          </div>
          <h3 className="font-bold text-white tracking-tight truncate mt-1 leading-tight">{item.name}</h3>
          <p className="text-[10px] text-slate-600 font-mono font-medium uppercase tracking-widest">{item.id}</p>
        </div>
      </div>
      <div className="flex items-center justify-between text-[10px] pt-4 border-t border-white/5 font-bold tracking-widest uppercase">
        <div className="text-slate-500">{item.category}</div>
        <div className="text-right">{item.currentHolder ? <div className="text-orange-500 truncate max-w-[120px]">{item.currentHolder}</div> : <div className="text-slate-800">STORAGE_DEPOT</div>}</div>
      </div>
      {item.projectName && <div className="bg-white text-slate-950 px-3 py-1.5 rounded-xl text-[9px] font-extrabold uppercase tracking-widest self-start shadow-xl shadow-white/5">@{item.projectName}</div>}
    </div>
  );
};

// --- Dashboard Component ---
const DashboardPage: React.FC<any> = ({ items, logs, onSelectItem, onAddEquipment, onEditEquipment, onDeleteEquipment, onViewQR, role, onRefresh, isSyncing }) => {
  const isAdmin = role === 'admin';
  
  const groupedItems = useMemo(() => {
    const groups: { [key: string]: Equipment[] } = {};
    items.forEach((item: Equipment) => {
      const cat = (item.category || 'Uncategorized').toUpperCase().trim();
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });
    Object.keys(groups).forEach(key => groups[key].sort((a, b) => a.name.localeCompare(b.name)));
    return groups;
  }, [items]);

  const sortedLogs = useMemo(() => {
    return [...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [logs]);

  const categories = useMemo(() => Object.keys(groupedItems).sort(), [groupedItems]);

  const stats = useMemo(() => ({
    total: items.length,
    available: items.filter((i: any) => i.status === EquipmentStatus.AVAILABLE).length,
    inUse: items.filter((i: any) => i.status === EquipmentStatus.IN_USE).length,
    maintenance: items.filter((i: any) => i.status === EquipmentStatus.MAINTENANCE).length
  }), [items]);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 max-w-full">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-1">
        <div className="space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="px-3 py-1 bg-white text-slate-950 text-[10px] font-extrabold uppercase tracking-widest rounded-lg shadow-lg shadow-white/10">{role} terminal</span>
            {isSyncing && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-[10px] font-bold text-orange-500 tracking-widest uppercase">Syncing...</span>
              </div>
            )}
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tighter uppercase leading-none">ASSETS LIST</h1>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button onClick={onRefresh} className={`p-5 glass text-slate-400 hover:text-white rounded-2xl transition-all shadow-xl ${isSyncing ? 'animate-spin' : ''}`}><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg></button>
          {isAdmin && <button onClick={onAddEquipment} className="flex-1 md:flex-none inline-flex items-center justify-center gap-3 bg-white hover:bg-slate-200 text-slate-950 font-extrabold py-4 px-8 rounded-2xl transition-all active:scale-95 text-[10px] uppercase tracking-widest shadow-xl shadow-white/5"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>REGISTER</button>}
          <Link to="/scan" className="flex-1 md:flex-none inline-flex items-center justify-center gap-3 bg-orange-600 hover:bg-orange-500 text-white font-extrabold py-4 px-8 rounded-2xl shadow-2xl shadow-orange-950 transition-all active:scale-95 text-[10px] uppercase tracking-widest">
            <ScanIcon />
            OPTICAL SCAN
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <StatCard label="Inventory Total" value={stats.total} color="bg-slate-800 text-slate-300" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>} />
        <StatCard label="พร้อมใช้งาน" value={stats.available} color="bg-green-500/20 text-green-400" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        <StatCard label="กำลังใช้งานอยู่" value={stats.inUse} color="bg-orange-500/20 text-orange-400" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>} />
        <StatCard label="กำลังซ่อมแซม" value={stats.maintenance} color="bg-slate-700/50 text-slate-400" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10 pb-24 md:pb-12">
        <div className="xl:col-span-2 space-y-16">
          {categories.length === 0 ? (
            <div className="py-32 glass rounded-[3rem] flex flex-col items-center justify-center text-center p-8 border-white/5">
               <p className="text-lg font-bold text-slate-600 uppercase tracking-widest">DEPOT_EMPTY</p>
               <button onClick={onRefresh} className="mt-6 px-8 py-4 bg-white text-slate-950 rounded-2xl text-[10px] font-extrabold uppercase tracking-widest shadow-xl">FETCH CLOUD</button>
            </div>
          ) : categories.map(cat => (
            <div key={cat} className="space-y-8">
              <div className="flex items-center gap-6 px-1">
                <h2 className="font-extrabold text-3xl text-white tracking-tighter uppercase whitespace-nowrap">{cat}</h2>
                <div className="h-px w-full bg-gradient-to-r from-white/10 to-transparent"></div>
                <div className="px-4 py-1 glass rounded-full text-[10px] font-extrabold text-slate-500 uppercase tracking-widest whitespace-nowrap border-white/5">{groupedItems[cat].length} UNITS</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {groupedItems[cat].map((item: any) => (
                  <EquipmentCard key={item.id} item={item} onSelect={onSelectItem} onViewQR={onViewQR} onEdit={onEditEquipment} onDelete={onDeleteEquipment} isAdmin={isAdmin} />
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="glass rounded-[3rem] border border-white/5 flex flex-col h-[600px] md:h-[800px] xl:sticky xl:top-28 shadow-2xl">
          <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
            <h2 className="font-extrabold text-2xl text-white tracking-tighter uppercase">Audit Log</h2>
            <div className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse shadow-[0_0_10px_rgba(249,115,22,0.5)]"></div>
          </div>
          <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1">
            {sortedLogs.length === 0 ? <div className="text-center py-32 text-slate-700 font-bold text-[10px] uppercase tracking-widest">LOGS_OFFLINE</div> : sortedLogs.map((log: any) => (
              <div key={log.id} className="flex gap-5 group">
                <div className={`mt-1 flex-shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center transition-all shadow-xl ${log.action === 'CHECK_OUT' ? 'bg-orange-500 text-white' : 'bg-white text-slate-950'}`}>{log.action === 'CHECK_OUT' ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 16l4-4m0 0l-4-4m4 4H7" /></svg> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M11 16l-4-4m0 0l4-4m-4 4h14" /></svg>}</div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-[14px] leading-snug mb-1">
                    <span className="font-bold text-white uppercase">{log.userName}</span>
                    <span className="text-slate-500 font-medium"> {log.action === 'CHECK_OUT' ? 'ขอเบิกใช้งาน' : 'ได้นำส่งคืน'} </span>
                    <span className="font-bold text-white truncate">{log.equipmentName}</span>
                  </p>
                  <p className="text-[9px] text-slate-600 uppercase font-bold tracking-widest">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {log.projectName ? `@${log.projectName}` : 'อยู่ในตู้สิ่งของ'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Scanner Component Page (Old Style Route) ---
const ScanPage: React.FC<{ onScan: (id: string) => void }> = ({ onScan }) => (
  <div className="flex flex-col items-center justify-center min-h-[80vh] py-12 space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-700">
    <div className="text-center space-y-4 px-6">
      <div className="mx-auto w-16 h-16 bg-white text-slate-950 rounded-2xl flex items-center justify-center mb-6 shadow-2xl shadow-white/5">
        <ScanIcon />
      </div>
      <h2 className="text-4xl font-extrabold text-white tracking-tighter uppercase">Optical Link</h2>
      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.3em]">Align asset tag with target viewfinder</p>
    </div>
    <div className="w-full max-w-lg px-4">
      <Scanner onScanSuccess={onScan} isActive={true} />
    </div>
    <Link to="/" className="inline-flex items-center gap-3 text-[11px] font-bold text-slate-500 hover:text-white uppercase tracking-widest transition-all px-8 py-4 glass rounded-2xl border-white/5">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
      BACK
    </Link>
  </div>
);

// --- QR Modal Component ---
const QRCodeModal: React.FC<{ item: Equipment; onClose: () => void }> = ({ item, onClose }) => (
  <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/90 backdrop-blur-2xl p-4 animate-in fade-in duration-300 overflow-hidden">
    <div className="glass rounded-[3rem] shadow-2xl w-full max-w-sm overflow-hidden transform animate-in zoom-in slide-in-from-bottom-10 duration-500 border-white/5">
      <div className="p-10 flex flex-col items-center text-center space-y-10">
        <div className="space-y-2">
          <p className="text-[11px] font-bold text-orange-500 uppercase tracking-[0.4em]">{item.category}</p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tighter uppercase leading-none">{item.name}</h2>
        </div>
        <div className="p-8 bg-white rounded-[2.5rem] shadow-[0_0_50px_rgba(255,255,255,0.1)] flex items-center justify-center w-full aspect-square">
          <QRCodeSVG value={item.id} size={220} level="H" includeMargin={false} className="w-full h-auto" />
        </div>
        <div className="space-y-4 w-full">
          <div className="bg-white/5 px-6 py-4 rounded-2xl flex items-center justify-between border border-white/5">
             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">ASSET_UID</span>
             <span className="text-sm font-mono font-bold text-white truncate ml-4">{item.id}</span>
          </div>
          <button onClick={onClose} className="w-full py-5 bg-white hover:bg-slate-200 text-slate-950 rounded-2xl font-extrabold text-[11px] uppercase tracking-widest transition-all shadow-xl"> CLOSE </button>
        </div>
      </div>
    </div>
  </div>
);

// --- Main App Component ---
const AppContent: React.FC = () => {
  const [items, setItems] = useState<Equipment[]>(() => JSON.parse(localStorage.getItem('equiptrack_data') || '[]'));
  const [logs, setLogs] = useState<AuditLog[]>(() => JSON.parse(localStorage.getItem('equiptrack_logs') || '[]'));
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [cloudStatus, setCloudStatus] = useState<'connected' | 'offline' | 'error'>('offline');
  const [selectedItem, setSelectedItem] = useState<Equipment | null>(null);
  const [isAddingEquipment, setIsAddingEquipment] = useState(false);
  const [editingItem, setEditingItem] = useState<Equipment | null>(null);
  const [viewingQRItem, setViewingQRItem] = useState<Equipment | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [syncLock, setSyncLock] = useState(false);

  const [alertConfig, setAlertConfig] = useState<{ isOpen: boolean; type: AlertType; title: string; message: string; onConfirm?: () => void; }>({ isOpen: false, type: 'info', title: '', message: '' });

  const showAlert = (type: AlertType, title: string, message: string, onConfirm?: () => void) => {
    setAlertConfig({ isOpen: true, type, title, message, onConfirm });
  };

  const location = useLocation();
  const navigate = useNavigate();

  const loadData = async (background = false) => {
    if (syncLock) return; 
    if (!background) setIsLoading(true);
    setIsSyncing(true);
    const webhookUrl = storageService.getWebhookUrl();
    try {
      const [fetchedItems, fetchedLogs] = await Promise.all([ storageService.getItems(), storageService.getLogs() ]);
      setItems(fetchedItems);
      setLogs(fetchedLogs);
      setCloudStatus(webhookUrl ? (fetchedItems.length > 0 ? 'connected' : 'error') : 'offline');
    } catch (e) {
      setCloudStatus('error');
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    loadData(true);
    const savedRole = localStorage.getItem('equiptrack_role') as UserRole;
    if (savedRole) setRole(savedRole);
  }, []);

  const handleLogin = (selectedRole: UserRole) => {
    setRole(selectedRole);
    localStorage.setItem('equiptrack_role', selectedRole);
    showAlert('success', 'ACCESS GRANTED', `Terminal Level: ${selectedRole.toUpperCase()}`);
  };

  const handleLogout = () => { setRole(null); localStorage.removeItem('equiptrack_role'); };

  const handleScanSuccess = (id: string) => {
    const item = items.find(i => i.id === id);
    if (item) { setSelectedItem(item); navigate('/'); }
    else { showAlert('error', 'ASSET_MISSING', `UID ${id} not found in depot.`); }
  };

  const lockSync = () => {
    setSyncLock(true);
    setTimeout(() => setSyncLock(false), 10000); 
  };

  // OPTIMIZED: Saving equipment is now optimistic
  const handleSaveEquipment = async (newItem: Equipment) => {
    const oldItems = [...items];
    const isEditing = !!editingItem;
    
    // 1. Update UI Locally immediately
    setItems(prevItems => {
        const index = prevItems.findIndex(i => i.id === newItem.id);
        if (index > -1) {
            const updated = [...prevItems];
            updated[index] = newItem;
            return updated;
        }
        return [newItem, ...prevItems];
    });

    // 2. Close Modal immediately
    setIsAddingEquipment(false);
    setEditingItem(null);
    if (!isEditing) setViewingQRItem(newItem);
    
    // 3. Fire-and-forget background sync
    setIsSyncing(true);
    lockSync();
    
    storageService[isEditing ? 'updateItem' : 'addItem'](newItem)
      .then(() => {
        setIsSyncing(false);
      })
      .catch((e) => {
        // Rollback only on hard failure
        setItems(oldItems);
        setIsSyncing(false);
        showAlert('error', 'CLOUD_SYNC_FAILED', 'Changes saved locally but failed to sync to cloud.');
      });
  };

  // OPTIMIZED: Deletion is now optimistic
  const handleDeleteItem = (item: Equipment) => {
    showAlert('confirm', 'WIPE ASSET', `Purge ${item.name} from depot?`, () => {
      const oldItems = [...items];
      
      // 1. Update UI immediately
      setItems(items.filter(i => i.id !== item.id));
      
      // 2. Background Sync
      setIsSyncing(true);
      lockSync();
      storageService.deleteItem(item.id)
        .then(() => setIsSyncing(false))
        .catch(e => {
          setItems(oldItems);
          setIsSyncing(false);
          showAlert('error', 'WIPE_FAILED', 'Cloud record exists but could not be removed.');
        });
    });
  };

  // OPTIMIZED: Action handling (Checkout/Return) is now lightning fast
  const handleAction = async (updatedItem: Equipment, userName: string, projectName?: string, notes?: string) => {
    const isCheckOut = updatedItem.status === EquipmentStatus.IN_USE;
    const oldItems = [...items];
    const oldLogs = [...logs];
    const tempLog: AuditLog = { 
      id: 'temp-' + Date.now(), 
      equipmentId: updatedItem.id, 
      equipmentName: updatedItem.name, 
      action: isCheckOut ? 'CHECK_OUT' : 'CHECK_IN', 
      userName, 
      projectName, 
      timestamp: new Date().toISOString(), 
      notes 
    };

    // 1. UPDATE UI IMMEDIATELY
    setItems(items.map(i => i.id === updatedItem.id ? updatedItem : i));
    setLogs([tempLog, ...logs]);
    
    // 2. CLOSE MODAL IMMEDIATELY
    setSelectedItem(null);
    
    // 3. BACKGROUND SYNC (Parallel)
    setIsSyncing(true);
    lockSync();

    Promise.all([
      storageService.updateItem(updatedItem),
      storageService.addLog({ 
        equipmentId: updatedItem.id, 
        equipmentName: updatedItem.name, 
        action: isCheckOut ? 'CHECK_OUT' : 'CHECK_IN', 
        userName, 
        projectName, 
        notes 
      })
    ]).then(() => {
      setIsSyncing(false);
    }).catch(e => {
      // Quietly log error or handle rollback if critical
      console.error("Background sync error:", e);
      setIsSyncing(false);
      // Optional: showAlert('warning', 'SYNC_LATENCY', 'Data saved locally but cloud update is slow.');
    });
  };

  if (!role) return <LoginPage onLogin={handleLogin} />;

  return (
    <div className="min-h-screen pb-32 md:pb-16 bg-slate-950 w-full max-w-[100vw] overflow-x-hidden">
      <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-3xl border-b border-white/5 px-6 py-5 mb-10 w-full shadow-2xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between w-full">
          <Link to="/" className="flex items-center gap-5 group overflow-hidden">
            <div className="w-12 h-12 bg-slate-900 p-2 rounded-2xl shadow-2xl border border-white/5 transition-transform group-hover:rotate-12 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-orange-500/5">
               <img src={LOGO_URL} alt="Logo" className="w-full h-full object-contain brightness-110" />
            </div>
            <div className="leading-none overflow-hidden">
              <span className="text-xl font-extrabold text-white tracking-tighter uppercase whitespace-nowrap">EquipTrack<span className="text-orange-500">Pro</span></span>
              <div className="flex items-center gap-2 mt-1">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isSyncing ? 'bg-orange-500 animate-ping' : cloudStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <div className="text-[10px] font-bold text-slate-500 tracking-[0.3em] uppercase whitespace-nowrap">{isSyncing ? 'TRANSMITTING...' : cloudStatus === 'connected' ? `ONLINE` : 'DISCONNECTED'}</div>
              </div>
            </div>
          </Link>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-8">
              <Link to="/" className={`text-[11px] font-extrabold tracking-widest transition-colors ${location.pathname === '/' ? 'text-orange-500' : 'text-slate-500 hover:text-white'}`}>DASHBOARD</Link>
              <Link to="/scan" className={`text-[11px] font-extrabold tracking-widest transition-colors ${location.pathname === '/scan' ? 'text-orange-500' : 'text-slate-500 hover:text-white'}`}>SCANNER</Link>
              <button onClick={() => setShowSettings(true)} className="p-2 text-slate-500 hover:text-white transition-colors"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg></button>
            </div>
            <button onClick={handleLogout} className="text-[10px] font-extrabold text-white tracking-widest uppercase bg-white/5 hover:bg-white/10 px-5 py-2.5 rounded-xl border border-white/10 transition-all">EXIT_TERMINAL</button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 w-full">
        {isLoading && items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 animate-pulse"><div className="w-14 h-14 border-4 border-white/5 border-t-orange-500 rounded-full animate-spin mb-6 shadow-2xl shadow-orange-500/20"></div><p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest text-center px-4">DECRYPTING ASSET DEPOT...</p></div>
        ) : (
          <Routes>
            <Route path="/" element={<DashboardPage items={items} logs={logs} onSelectItem={setSelectedItem} onAddEquipment={() => setIsAddingEquipment(true)} onEditEquipment={setEditingItem} onDeleteEquipment={handleDeleteItem} onViewQR={setViewingQRItem} role={role} onRefresh={() => { setSyncLock(false); loadData(); }} isSyncing={isSyncing} />} />
            <Route path="/scan" element={<ScanPage onScan={handleScanSuccess} />} />
          </Routes>
        )}
      </main>

      {/* Mobile Sticky Action Bar */}
      <div className="md:hidden fixed bottom-10 left-8 right-8 z-50">
        <div className="bg-slate-900/90 backdrop-blur-3xl border border-white/10 p-3 rounded-[3rem] shadow-[0_30px_60px_rgba(0,0,0,0.8)] flex justify-around items-center">
          <Link to="/" className={`p-5 rounded-[2rem] transition-all duration-500 ${location.pathname === '/' ? 'bg-white text-slate-950 shadow-2xl' : 'text-slate-600'}`}><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg></Link>
          <Link to="/scan" className="relative -mt-16 bg-orange-600 p-6 rounded-full shadow-[0_0_40px_rgba(249,115,22,0.6)] border-[6px] border-slate-950 active:scale-90 transition-all text-white">
            <ScanIcon />
          </Link>
          <button onClick={() => setShowSettings(true)} className="p-5 rounded-[2rem] transition-all text-slate-600"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg></button>
        </div>
      </div>
      
      {selectedItem && <EquipmentActionModal item={selectedItem} onClose={() => setSelectedItem(null)} onAction={handleAction} />}
      {(isAddingEquipment || editingItem) && <EquipmentFormModal item={editingItem || undefined} onClose={() => { setIsAddingEquipment(false); setEditingItem(null); }} onSave={handleSaveEquipment} />}
      {viewingQRItem && <QRCodeModal item={viewingQRItem} onClose={() => setViewingQRItem(null)} />}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      <CustomAlert isOpen={alertConfig.isOpen} type={alertConfig.type} title={alertConfig.title} message={alertConfig.message} onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))} onConfirm={alertConfig.onConfirm} />
    </div>
  );
};

const App: React.FC = () => <HashRouter><AppContent /></HashRouter>;
export default App;
