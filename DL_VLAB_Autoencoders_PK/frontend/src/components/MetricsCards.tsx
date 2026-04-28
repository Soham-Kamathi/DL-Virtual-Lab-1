"use client";

import React from "react";

type Props = {
  psnr?: number[];
  ssim?: number[];
};

export default function MetricsCards({ psnr = [], ssim = [] }: Props) {
  const finalPsnr = psnr.length > 0 ? psnr[psnr.length - 1] : null;
  const finalSsim = ssim.length > 0 ? ssim[ssim.length - 1] : null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="bg-white border rounded-lg p-5 text-center shadow-sm">
        <p className="text-xs tracking-widest uppercase text-gray-500">
          Final PSNR
        </p>
        <p className="text-4xl text-[#ff6600] font-light mt-2">
          {finalPsnr !== null ? finalPsnr.toFixed(2) : "N/A"}
          <span className="text-base text-gray-400"> dB</span>
        </p>
      </div>

      <div className="bg-white border rounded-lg p-5 text-center shadow-sm">
        <p className="text-xs tracking-widest uppercase text-gray-500">
          Final SSIM
        </p>
        <p className="text-4xl text-[#3399cc] font-light mt-2">
          {finalSsim !== null ? finalSsim.toFixed(4) : "N/A"}
        </p>
      </div>
    </div>
  );
}
