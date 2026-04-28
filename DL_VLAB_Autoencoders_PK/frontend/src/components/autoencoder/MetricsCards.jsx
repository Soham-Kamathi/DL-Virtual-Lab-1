"use client";

import React from "react";

export default function MetricsCards({ metrics }) {
  const psnr = metrics?.psnr || [];
  const ssim = metrics?.ssim || [];

  const finalPSNR = psnr.length ? psnr[psnr.length - 1] : null;
  const finalSSIM = ssim.length ? ssim[ssim.length - 1] : null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="bg-white border p-5 rounded-lg text-center shadow-sm">
        <p className="text-xs uppercase tracking-wider text-gray-500">
          Final PSNR
        </p>
        <p className="text-4xl font-light text-[#ff6600] mt-2">
          {finalPSNR !== null ? finalPSNR.toFixed(2) : "N/A"}
          <span className="text-base text-gray-400"> dB</span>
        </p>
      </div>

      <div className="bg-white border p-5 rounded-lg text-center shadow-sm">
        <p className="text-xs uppercase tracking-wider text-gray-500">
          Final SSIM
        </p>
        <p className="text-4xl font-light text-[#3399cc] mt-2">
          {finalSSIM !== null ? finalSSIM.toFixed(4) : "N/A"}
        </p>
      </div>
    </div>
  );
}
