
import React, { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface ScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (error: string) => void;
  isActive: boolean;
}

const Scanner: React.FC<ScannerProps> = ({ onScanSuccess, onScanError, isActive }) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (isActive) {
      // Configuration optimized for mobile
      scannerRef.current = new Html5QrcodeScanner(
        "reader",
        { 
          fps: 15, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          rememberLastUsedCamera: true,
          supportedScanTypes: [0, 1] // Supports both QR and Barcodes
        },
        /* verbose= */ false
      );

      scannerRef.current.render(
        (decodedText) => {
          onScanSuccess(decodedText);
          // Auto-vibrate for success if supported
          if (window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate(100);
          }
        },
        (error) => {
          if (onScanError) onScanError(error);
        }
      );
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.debug("Scanner clear ignore:", err));
      }
    };
  }, [isActive, onScanSuccess, onScanError]);

  return (
    <div className="w-full max-w-sm mx-auto overflow-hidden rounded-[2.5rem] bg-slate-900 shadow-2xl border-4 border-slate-800">
      <div className="bg-slate-800/50 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Lens Active</span>
        <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)] animate-pulse"></div>
      </div>
      <div id="reader" className="scanner-container"></div>
      <div className="p-6 bg-slate-900 text-[10px] font-black text-slate-500 text-center uppercase tracking-widest leading-relaxed">
        Align Asset Tag Inside Frame<br/>
        <span className="text-slate-700 opacity-50">Back Camera Enabled</span>
      </div>
      <style>{`
        #reader { border: none !important; }
        #reader__scan_region { display: flex; justify-content: center; }
        #reader__dashboard_section_csr button {
          background-color: #3b82f6 !important;
          color: white !important;
          border-radius: 1rem !important;
          padding: 8px 16px !important;
          font-weight: 800 !important;
          text-transform: uppercase !important;
          font-size: 10px !important;
          letter-spacing: 0.1em !important;
          border: none !important;
          margin-top: 10px !important;
        }
        #reader__status_span { display: none !important; }
        #reader video { border-radius: 1.5rem !important; }
      `}</style>
    </div>
  );
};

export default Scanner;
