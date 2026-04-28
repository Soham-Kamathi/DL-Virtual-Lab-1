import React from "react";
import Image from "next/image";

export default function Header() {
  return (
    <header className="bg-white border-b-4 border-[#ff6600] z-50 sticky top-0">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
        {/* Logo + Title */}
        <div className="flex items-center gap-4">
          <Image
            src="/vesit-logo.png"
            alt="VESIT Logo"
            width={220}
            height={60}
            className="h-14 w-auto object-contain"
            priority
          />
          <div className="hidden sm:block border-l-2 border-gray-300 pl-4">
            <span className="text-[12px] font-bold text-gray-600 uppercase tracking-widest">
              Department of Computer Engineering
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-[13px] font-semibold tracking-wider">
          <a href="#" className="text-[#3399cc] hover:text-[#ff6600] transition-colors">HOME</a>
          <a href="#" className="text-[#3399cc] hover:text-[#ff6600] transition-colors">PARTNERS</a>
          <a href="#" className="text-[#3399cc] hover:text-[#ff6600] transition-colors">CONTACT</a>
        </nav>
      </div>
    </header>
  );
}
