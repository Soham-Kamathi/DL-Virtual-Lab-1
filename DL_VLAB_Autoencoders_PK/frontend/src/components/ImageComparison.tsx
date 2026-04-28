"use client";

import React from "react";

type Images = {
  original?: string;
  noisy?: string;
  denoised?: string;
};

type Props = {
  images: Images | null;
  medicalMode: boolean;
};

const API_BASE = "http://127.0.0.1:8000";

function toAbsolute(src: string) {
  if (src.startsWith("http://") || src.startsWith("https://")) {
    return src;
  }
  return `${API_BASE}${src}`;
}

export default function ImageComparison({ images, medicalMode }: Props) {
  if (!images) {
    return (
      <div className="bg-white border rounded-lg p-5">
        <h4 className="font-semibold text-gray-700 mb-2">
          Image Reconstruction Panel
        </h4>
        <p className="text-sm text-gray-500">
          Run simulation to load Original, Noisy, and Denoised outputs.
        </p>
      </div>
    );
  }

  const noisyLabel = medicalMode ? "Noisy Scan" : "Noisy Image";
  const denoisedLabel = medicalMode ? "Denoised Scan" : "Denoised Output";

  const cards = [
    { key: "original", title: "Original Image", src: images.original },
    { key: "noisy", title: noisyLabel, src: images.noisy },
    { key: "denoised", title: denoisedLabel, src: images.denoised },
  ];

  return (
    <div className="bg-white border rounded-lg p-5">
      <h4 className="font-semibold text-gray-700 mb-4">
        Image Reconstruction Panel
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div key={card.key} className="text-center">
            <p className="text-xs tracking-wide uppercase text-gray-500 mb-2">
              {card.title}
            </p>
            {card.src ? (
              <div className="overflow-hidden rounded border bg-gray-50">
                <img
                  src={toAbsolute(card.src)}
                  alt={card.title}
                  className="w-full aspect-square object-contain [image-rendering:pixelated] transition-transform duration-300 hover:scale-150"
                  onError={(e) => {
                    e.currentTarget.src = card.src || "";
                  }}
                />
              </div>
            ) : (
              <div className="w-full aspect-square rounded border bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                Not available
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
