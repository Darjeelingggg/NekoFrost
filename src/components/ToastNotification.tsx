"use client";

import React, { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import { CheckCircle2, ShoppingBag, X } from "lucide-react";

export default function ToastNotification() {
  const { toastMessage, showToast, setIsCartOpen, cartCount } = useApp();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!toastMessage) {
      setVisible(false);
      setProgress(100);
      return;
    }

    // Trigger smooth entrance transition
    setProgress(100);
    const enterTimer = setTimeout(() => {
      setVisible(true);
    }, 20);

    // Smooth linear countdown bar
    const duration = 3200;
    const intervalTime = 32;
    const decrement = (intervalTime / duration) * 100;

    const progressTimer = setInterval(() => {
      setProgress((prev) => Math.max(0, prev - decrement));
    }, intervalTime);

    // Smooth exit transition before unmounting
    const exitTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        showToast("");
      }, 350);
    }, duration);

    return () => {
      clearTimeout(enterTimer);
      clearInterval(progressTimer);
      clearTimeout(exitTimer);
    };
  }, [toastMessage, showToast]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      showToast("");
    }, 300);
  };

  if (!toastMessage) return null;

  return (
    <div
      className={`fixed top-5 sm:top-6 right-4 sm:right-6 z-50 max-w-sm w-[calc(100%-2rem)] sm:w-auto pointer-events-auto transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        visible
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 -translate-y-4 scale-95"
      }`}
    >
      <div className="bg-[#1E447C]/95 backdrop-blur-md text-white p-3.5 sm:p-4 rounded-2xl shadow-[0_16px_36px_-6px_rgba(30,68,124,0.4)] border border-white/20 flex flex-col gap-2.5 relative overflow-hidden">
        <div className="flex items-center justify-between gap-3">
          {/* Status Icon & Message */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#EBA9B5] text-[#1E447C] flex items-center justify-center flex-shrink-0 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-[#1E447C]" />
            </div>

            <div className="min-w-0">
              <span className="text-[10px] font-bold text-[#EBA9B5] block uppercase tracking-wider">
                Berhasil Ditambahkan
              </span>
              <p className="text-xs font-semibold text-white truncate max-w-[180px] sm:max-w-[210px]">
                {toastMessage}
              </p>
            </div>
          </div>

          {/* Action & Close */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={() => {
                handleClose();
                setIsCartOpen(true);
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#EBA9B5] text-[#1E447C] text-xs font-black hover:bg-white transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Lihat ({cartCount})</span>
            </button>

            <button
              onClick={handleClose}
              className="p-1 rounded-full text-white/60 hover:text-white transition-colors"
              aria-label="Tutup notifikasi"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Soft countdown line */}
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#EBA9B5] rounded-full transition-all duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
