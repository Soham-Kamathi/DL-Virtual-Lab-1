"use client";

import React from "react";

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const sections = [
  { id: "aim", label: "Aim" },
  { id: "outcomes", label: "Learning Outcomes" },
  { id: "theory", label: "Theory" },
  { id: "procedure", label: "Procedure" },
  { id: "simulation", label: "Simulation" },
  { id: "observation", label: "Observation" },
  { id: "quiz", label: "Quiz" },
  { id: "references", label: "References" },
];

export default function Sidebar({ activeSection, setActiveSection }: SidebarProps) {
  return (
    <aside className="w-64 bg-white min-h-[calc(100vh-80px)] border-r">
      <nav className="flex flex-col">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`text-left text-[14px] font-medium transition-all px-6 py-3 border-b border-gray-100 ${
              activeSection === section.id
                ? "bg-[#1e3a8a] text-white border-l-4 border-l-[#ff6600]"
                : "text-[#333333] hover:bg-gray-50 hover:text-[#ff6600]"
            }`}
          >
            {section.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
