"use client";

import React, { useState, useRef, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { X, MessageSquare, PhoneCall } from "lucide-react";

export default function WhatsAppButton() {
  const { cartCount } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const contactList = [
    {
      name: "Thalita",
      phone: "0812 1159 6287",
      waLink: "https://wa.me/6281211596287?text=Halo%20Kak%20Thalita!%20Saya%20ingin%20tanya%20seputar%20pemesanan%20NekoFrost...",
      role: "Contact Person 1",
    },
    {
      name: "Geanda",
      phone: "0858 3551 9729",
      waLink: "https://wa.me/6285835519729?text=Halo%20Kak%20Geanda!%20Saya%20ingin%20tanya%20seputar%20pemesanan%20NekoFrost...",
      role: "Contact Person 2",
    },
  ];

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <aside
      ref={containerRef}
      aria-label="Kontak WhatsApp"
      className={`fixed right-4 sm:right-6 z-40 transition-all duration-300 ${cartCount > 0 ? "bottom-24 sm:bottom-6" : "bottom-6"
        }`}
    >
      {/* Contact Person Selection Popup Modal */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-72 sm:w-80 bg-white rounded-3xl p-4 shadow-2xl border border-[#E2DDD0] animate-fadeIn select-none mb-2">
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-[#EFEBE1]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-[#1E447C]">Contact Person NekoFrost</h4>
                <p className="text-[10px] text-[#7C8B9E]">Siap bantu tanya menu &amp; pengantaran</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full text-[#7C8B9E] hover:text-[#1E447C] hover:bg-neutral-100 transition-colors"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Contact Cards List */}
          <div className="space-y-2.5">
            {contactList.map((cp, idx) => (
              <a
                key={idx}
                href={cp.waLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF8F2] hover:bg-emerald-50 border border-[#E8E3D8] hover:border-emerald-300 transition-all group active:scale-98"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-[#1E447C] group-hover:text-emerald-700 transition-colors">
                      {cp.name}
                    </span>
                    <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-white text-[#7C8B9E] border border-[#E2DDD0]">
                      {cp.role}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#2B5EA9] block mt-0.5">
                    {cp.phone}
                  </span>
                </div>

                <div className="px-3 py-1.5 rounded-full bg-[#25D366] text-white text-[11px] font-bold group-hover:scale-105 transition-transform flex items-center gap-1 shadow-xs">
                  <span>Chat</span>
                  <span>&rarr;</span>
                </div>
              </a>
            ))}
          </div>

          <p className="text-[10px] text-center text-[#8C9BAE] mt-3">
            Stand Buka • Siap Antar ke Kelas &amp; Kosan
          </p>
        </div>
      )}

      {/* Main Trigger Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Hubungi Contact Person via WhatsApp"
        className="group flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white pl-3.5 pr-4 py-2.5 sm:py-3 rounded-full shadow-lg shadow-emerald-900/25 hover:shadow-xl transition-all duration-200 active:scale-95 border border-white/20 select-none cursor-pointer"
        title="Hubungi Contact Person (Thalita & Geanda)"
      >
        {/* WhatsApp Official Logo SVG */}
        <div className="relative flex-shrink-0 w-6 h-6 flex items-center justify-center">
          <svg
            className="w-6 h-6 fill-white"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.886 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          {/* Active Online Indicator */}
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-white rounded-full flex items-center justify-center">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          </span>
        </div>

        {/* Text Label */}
        <div className="flex flex-col text-left leading-tight">
          <span className="text-[11px] font-bold text-white tracking-wide">
            Chat Contact Person
          </span>
          <span className="text-[9px] text-white/80 font-medium">
            Thalita &amp; Geanda
          </span>
        </div>
      </button>
    </aside>
  );
}
