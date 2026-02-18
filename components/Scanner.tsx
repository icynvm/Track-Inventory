
import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

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
          qrbox: { width: 250, height: 250 },
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
            // Log errors silently to avoid UI clutter during continuous scanning
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
    <div className="relative w-full max-w-sm mx-auto overflow-hidden rounded-[3rem] bg-black shadow-2xl border-4 border-slate-900 group">
      {/* Custom Scan Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none border-[40px] border-black/40">
        <div className="w-full h-full relative">
          {/* Corner Brackets */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-xl"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-xl"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-xl"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-xl"></div>
          
          {/* Scanning Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-[scan_2s_ease-in-out_infinite] opacity-50"></div>
        </div>
      </div>

      <div className="bg-slate-900/80 backdrop-blur-md px-6 py-4 flex items-center justify-between absolute top-0 left-0 right-0 z-20">
        <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Matrix Lens Ready</span>
        <div className="flex gap-1">
          <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse"></div>
          <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse delay-75"></div>
          <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse delay-150"></div>
        </div>
      </div>

      <div id="reader" className="w-full aspect-square bg-slate-900"></div>

      {isInitializing && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-30">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Warming Sensors...</p>
          </div>
        </div>
      )}

      <div className="p-6 bg-slate-900 text-[10px] font-black text-slate-400 text-center uppercase tracking-widest leading-relaxed">
        Fast-track Scan Enabled<br/>
        <span className="text-blue-500/50">Auto-Reflecting Data to Cloud</span>
      </div>

      <style>{`
        @keyframes scan {
          0%, 100% { top: 10%; opacity: 0; }
          50% { top: 90%; opacity: 0.8; }
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
