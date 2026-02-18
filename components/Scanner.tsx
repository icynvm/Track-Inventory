
import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface ScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (error: string) => void;
  isActive: boolean;
}

const Scanner: React.FC<ScannerProps> = ({ onScanSuccess, onScanError, isActive }) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const startScanner = async () => {
      try {
        const html5QrCode = new Html5Qrcode("reader");
        scannerRef.current = html5QrCode;
        
        const config = { 
          fps: 20, 
          qrbox: { width: 280, height: 280 },
          aspectRatio: 1.0,
        };

        await html5QrCode.start(
          { facingMode: "environment" },
          config,
          (decodedText) => {
            if (window.navigator && window.navigator.vibrate) {
              window.navigator.vibrate(50);
            }
            onScanSuccess(decodedText);
          },
          (errorMessage) => {
            if (onScanError) onScanError(errorMessage);
          }
        );
        setIsInitializing(false);
      } catch (err) {
        console.error("Scanner Start Error:", err);
        setIsInitializing(false);
      }
    };

    if (isActive) {
      startScanner();
    }

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().then(() => {
          scannerRef.current?.clear();
        }).catch(err => console.debug("Scanner stop error:", err));
      }
    };
  }, [isActive, onScanSuccess, onScanError]);

  return (
    <div className="relative w-full mx-auto overflow-hidden rounded-[2.5rem] bg-black shadow-2xl border-4 border-slate-900 group">
      {/* Custom Scan Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
        {/* Darkened edges */}
        <div className="absolute inset-0 bg-black/40 shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]"></div>
        
        {/* Viewfinder area */}
        <div className="relative w-[280px] h-[280px]">
          {/* Neon Corners */}
          <div className="absolute -top-1 -left-1 w-12 h-12 border-t-[6px] border-l-[6px] border-orange-500 rounded-tl-2xl shadow-[0_0_15px_rgba(249,115,22,0.6)]"></div>
          <div className="absolute -top-1 -right-1 w-12 h-12 border-t-[6px] border-r-[6px] border-orange-500 rounded-tr-2xl shadow-[0_0_15px_rgba(249,115,22,0.6)]"></div>
          <div className="absolute -bottom-1 -left-1 w-12 h-12 border-b-[6px] border-l-[6px] border-orange-500 rounded-bl-2xl shadow-[0_0_15px_rgba(249,115,22,0.6)]"></div>
          <div className="absolute -bottom-1 -right-1 w-12 h-12 border-b-[6px] border-r-[6px] border-orange-500 rounded-br-2xl shadow-[0_0_15px_rgba(249,115,22,0.6)]"></div>
          
          {/* Animated Scan Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent animate-[scan_2s_ease-in-out_infinite] opacity-80 blur-[1px]"></div>
          
          {/* Center Target */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 border-2 border-orange-500/30 rounded-full"></div>
        </div>
      </div>

      <div className="bg-slate-900/80 backdrop-blur-md px-6 py-4 flex items-center justify-between absolute top-0 left-0 right-0 z-20">
        <span className="text-[10px] font-bold text-white uppercase tracking-[0.2em] flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
          Sensors Active
        </span>
        <div className="flex gap-1">
          <div className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse"></div>
          <div className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse delay-150"></div>
        </div>
      </div>

      <div id="reader" className="w-full aspect-square bg-slate-950"></div>

      {isInitializing && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-30">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Initializing Lens...</p>
          </div>
        </div>
      )}

      <div className="p-4 md:p-6 bg-slate-900 text-[10px] font-bold text-slate-400 text-center uppercase tracking-widest leading-relaxed">
        Secure Matrix Stream<br/>
        <span className="text-orange-500/50 uppercase">Auto-locking on metadata</span>
      </div>

      <style>{`
        @keyframes scan {
          0%, 100% { top: 5%; opacity: 0; }
          50% { top: 95%; opacity: 1; }
        }
        #reader video { 
          object-fit: cover !important; 
          width: 100% !important; 
          height: 100% !important;
        }
      `}</style>
    </div>
  );
};

export default Scanner;
