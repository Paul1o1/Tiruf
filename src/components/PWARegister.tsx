'use client';

import { useEffect, useState } from 'react';
import { Share, PlusSquare, X, ArrowDown, HelpCircle, Check } from 'lucide-react';

export default function PWARegister() {
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Register Service Worker
    if (
      ('serviceWorker' in navigator && window.location.protocol === 'https:') ||
      window.location.hostname === 'localhost' ||
      window.location.hostname.startsWith('172.') ||
      window.location.hostname.startsWith('192.')
    ) {
      navigator.serviceWorker
        .register('/sw.js')
        .catch((err) => console.log('SW registration note:', err));
    }

    // Detect if user is on iOS Safari and not already in standalone app mode
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !(window as unknown as { MSStream?: unknown }).MSStream;
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as unknown as { standalone?: boolean }).standalone;

    if (isIOS && !isStandalone) {
      const dismissed = sessionStorage.getItem('tiruf_ios_pwa_dismissed');
      if (!dismissed) {
        const timer = setTimeout(() => setShowIOSPrompt(true), 1500);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  function dismissPrompt(e?: React.MouseEvent) {
    if (e) e.stopPropagation();
    setShowIOSPrompt(false);
    sessionStorage.setItem('tiruf_ios_pwa_dismissed', 'true');
  }

  if (!showIOSPrompt) return null;

  return (
    <>
      {/* ── Bottom Banner with Guide ── */}
      <div
        className="fixed bottom-4 left-3 right-3 z-50 sm:hidden animate-in fade-in slide-in-from-bottom-5 duration-200"
        onClick={() => setShowModal(true)}
      >
        <div className="bg-[#1C2F72] text-white p-4 rounded-2xl shadow-2xl border border-white/20 relative cursor-pointer">
          <button
            onClick={dismissPrompt}
            className="absolute top-2.5 right-2.5 text-white/60 hover:text-white p-1 rounded-full hover:bg-white/10"
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-[#1C2F72] flex items-center justify-center font-black text-lg shrink-0 shadow-md">
              T
            </div>

            <div className="flex-1 pr-4">
              <div className="font-bold text-sm flex items-center gap-1.5">
                <span>Install Tiruf App</span>
                <span className="text-[10px] font-semibold bg-[#35BDD0]/20 text-[#35BDD0] px-2 py-0.5 rounded-full border border-[#35BDD0]/30">
                  iOS Safari
                </span>
              </div>
              <p className="text-xs text-white/80 mt-1 leading-relaxed">
                Tap Safari&apos;s <strong className="text-white underline">Share button ⎋</strong> at the bottom of your phone, then select <strong className="text-white underline">Add to Home Screen</strong>.
              </p>
              <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-[#35BDD0] font-bold">
                <HelpCircle size={13} />
                <span>Tap here to see visual guide</span>
              </div>
            </div>
          </div>

          {/* Animated pointer arrow pointing to Safari's bottom toolbar */}
          <div className="flex justify-center -mb-2 mt-2">
            <div className="flex items-center gap-1 text-[11px] font-bold text-[#35BDD0] bg-[#12234E] px-3 py-1 rounded-full border border-white/15 animate-bounce">
              <ArrowDown size={12} />
              <span>Safari bottom bar below</span>
              <ArrowDown size={12} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Visual Step-by-Step Modal ── */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white text-slate-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-full"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-[#1C2F72] text-white flex items-center justify-center font-black text-xl shadow-md">
                T
              </div>
              <div>
                <h3 className="font-black text-base text-[#12234E]">
                  How to Install on iPhone
                </h3>
                <p className="text-xs text-slate-500">
                  Apple Safari requires 3 simple taps
                </p>
              </div>
            </div>

            <div className="space-y-4 my-5 text-xs text-slate-700">
              {/* Step 1 */}
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-6 h-6 rounded-full bg-[#1C2F72] text-white flex items-center justify-center font-bold text-xs shrink-0">
                  1
                </div>
                <div>
                  <div className="font-bold text-slate-900 mb-0.5">
                    Tap Safari&apos;s Share button
                  </div>
                  <p className="text-slate-500 leading-normal">
                    Look at the <strong>bottom toolbar of your Safari browser</strong> (outside this webpage) and tap the <span className="inline-flex items-center gap-0.5 font-bold text-[#1C2F72]"><Share size={12} /> Share</span> icon.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-6 h-6 rounded-full bg-[#1C2F72] text-white flex items-center justify-center font-bold text-xs shrink-0">
                  2
                </div>
                <div>
                  <div className="font-bold text-slate-900 mb-0.5">
                    Tap &quot;Add to Home Screen&quot;
                  </div>
                  <p className="text-slate-500 leading-normal">
                    Scroll down Safari&apos;s share menu and select <span className="inline-flex items-center gap-0.5 font-bold text-[#1C2F72]"><PlusSquare size={12} /> Add to Home Screen</span>.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  3
                </div>
                <div>
                  <div className="font-bold text-slate-900 mb-0.5">
                    Tap &quot;Add&quot; in the top-right
                  </div>
                  <p className="text-slate-500 leading-normal">
                    Confirm by tapping <strong>Add</strong> in the top-right corner. The Tiruf app icon will appear on your home screen!
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="w-full py-3 rounded-xl bg-[#1C2F72] text-white font-bold text-sm shadow-md hover:bg-[#16255c] transition-all cursor-pointer"
            >
              Got it, let me do that!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
