import React from "react";
import Image from "next/image";

export default function Header() {
  return (
    <header className="bg-white border-b-4 border-[#ff6600] z-50 sticky top-0">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between relative">
        {/* Left Section: Logo */}
        <div className="flex items-center">
          <div className="w-[220px] h-[60px] flex items-center justify-center text-xs text-gray-500 border border-gray-300">
            <img src="/vesit-logo.png" alt="VESIT Logo" className="h-12 w-auto object-contain mix-blend-multiply" />
          </div>
        </div>

        {/* Center Section: Absolute Title */}
        <div className="absolute left-1/2 transform -translate-x-1/2 hidden sm:flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-900">
            <path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2" />
            <path d="M8.5 2h7" />
            <path d="M14 16H5.3" />
          </svg>
          <span className="text-xl md:text-2xl font-bold text-blue-900 tracking-widest uppercase">
            VESIT VIRTUAL LABS
          </span>
        </div>

        {/* Right Section: Visual Balance */}
        <div className="hidden md:flex w-[220px] justify-end"></div>
      </div>
    </header>
  );
}