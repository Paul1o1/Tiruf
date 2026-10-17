'use client';

import { useEffect, useState } from 'react';
import { Share, PlusSquare, X } from 'lucide-react';

export default function PWARegister() {
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);

  useEffect(() => {
    // Register Service Worker
    if ('serviceWorker' in navigator && window.location.protocol === 'https:' || window.location.hostname === 'localhost') {
      navigator.serviceWorker
        .register('/sw.js')
        .catch((err) => console.log('SW registration skipped or failed:', err));
    }

    // Detect if user is on iOS Safari and not in standalone mode
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as unknown as { standalone?: boolean }).standalone;

    if (isIOS && !isStandalone) {
      const dismissed = localStorage.getItem('tiruf_ios_pwa_dismissed');
      if (!dismissed) {
        // Show after 3 seconds on iOS
        const timer = setTimeout(() => setShowIOSPrompt(true), 3000);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  function dismissPrompt() {
    setShowIOSPrompt(false);
    localStorage.setItem('tiruf_ios_pwa_dismissed', 'true');
  }

  if (!showIOSPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 sm:hidden">
      <div className="bg-[#1C2F72] text-white p-4 rounded-2xl shadow-2xl border border-white/20 relative flex items-start gap-3">
        <button
          onClick={dismissPrompt}
          className="absolute top-2.5 right-2.5 text-white/60 hover:text-white p-1"
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>

        <div className="w-10 h-10 rounded-xl bg-white text-[#1C2F72] flex items-center justify-center font-black text-lg shrink-0 shadow-md">
          T
        </div>

        <div className="flex-1 pr-4">
          <div className="font-bold text-sm">Install Tiruf on your iPhone</div>
          <p className="text-xs text-white/80 mt-1 leading-relaxed">
            Install this app on your phone: tap the <span className="inline-flex items-center gap-0.5 font-bold text-[#35BDD0]"><Share size={12} /> Share</span> button below, then select <span className="inline-flex items-center gap-0.5 font-bold text-[#35BDD0]"><PlusSquare size={12} /> Add to Home Screen</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
