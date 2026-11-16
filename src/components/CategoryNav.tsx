"use client";

import React from "react";
import { Flame, Drumstick, GlassWater, Sparkles, Utensils } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { ProductCategory } from "@/types";

interface CategoryItem {
  id: ProductCategory;
  label: string;
  icon: React.ElementType;
}

const mainCategories: CategoryItem[] = [
  { id: "all", label: "Semua", icon: Flame },
  { id: "paket", label: "Paket", icon: Sparkles },
  { id: "boneless", label: "Chichick", icon: Drumstick },
  { id: "snacks", label: "Snack", icon: Utensils },
  { id: "beverages", label: "Yuzu", icon: GlassWater },
];

export default function CategoryNav() {
  const { activeCategory, setActiveCategory } = useApp();

  return (
    <div className="w-full pt-2 pb-2">
      {/* Primary Category Bar (Sea Breeze Theme #2B5EA9) */}
      <div className="bg-[#2B5EA9] rounded-2xl p-2 sm:p-2.5 shadow-md">
        <div className="grid grid-cols-5 gap-1 sm:gap-2">
          {mainCategories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all ${
                  isActive
                    ? "bg-[#1E447C] text-white shadow-inner scale-[1.02]"
                    : "text-[#D5E3F7] hover:text-white hover:bg-[#386CB7]"
                }`}
              >
                <div className="p-1 rounded-full mb-1">
                  <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? "text-[#EBA9B5]" : "text-current"}`} />
                </div>
                <span className="text-[10px] sm:text-xs font-semibold tracking-tight truncate max-w-full">
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
