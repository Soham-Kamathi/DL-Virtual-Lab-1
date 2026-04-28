"use client";

import React, { useMemo, useState } from "react";

type PreviewSample = {
  image: number[];
  label: string;
};

type Props = {
  previewSamples: PreviewSample[];
  noiseFactor: number;
  medicalMode: boolean;
};

function clamp(val: number) {
  return Math.max(0, Math.min(1, val));
}

function addNoise(image: number[], noiseFactor: number) {
  return image.map((pixel) =>
    clamp(pixel + (Math.random() - 0.5) * 2 * noiseFactor),
  );
}

function denoiseSimple(image: number[]) {
  const out = [...image];
  const idx = (r: number, c: number) => r * 28 + c;

  for (let r = 1; r < 27; r += 1) {
    for (let c = 1; c < 27; c += 1) {
      const neighbors = [
        image[idx(r, c)],
        image[idx(r - 1, c)],
        image[idx(r + 1, c)],
        image[idx(r, c - 1)],
        image[idx(r, c + 1)],
      ];
      out[idx(r, c)] =
        neighbors.reduce((sum, v) => sum + v, 0) / neighbors.length;
    }
  }
  return out;
}

function CanvasImage({ pixels }: { pixels: number[] }) {
  return (
    <canvas
      width={28}
      height={28}
      className="w-full h-full [image-rendering:pixelated]"
      ref={(el) => {
        if (!el) return;
        const ctx = el.getContext("2d");
        if (!ctx) return;
        const imgData = ctx.createImageData(28, 28);
        for (let i = 0; i < 784; i += 1) {
          const val = clamp(pixels[i] || 0) * 255;
          imgData.data[i * 4] = val;
          imgData.data[i * 4 + 1] = val;
          imgData.data[i * 4 + 2] = val;
          imgData.data[i * 4 + 3] = 255;
        }
        ctx.putImageData(imgData, 0, 0);
      }}
    />
  );
}

export default function DenoisingSandbox({
  previewSamples,
  noiseFactor,
  medicalMode,
}: Props) {
  const [index, setIndex] = useState(0);
  const sample = previewSamples[index] || null;

  const noisyAndDenoised = useMemo(() => {
    if (!sample) return null;
    const noisy = addNoise(sample.image, noiseFactor);
    const denoised = denoiseSimple(noisy);
    return { noisy, denoised };
  }, [sample, noiseFactor]);

  const noisyLabel = medicalMode ? "Noisy Scan" : "Noisy Input";
  const denoisedLabel = medicalMode ? "Denoised Scan" : "Denoised Output";

  return (
    <div className="bg-white border rounded-lg p-5">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-700">Denoising Sandbox</h4>
        <button
          className="px-3 py-1.5 text-xs font-semibold rounded bg-[#3399cc] text-white hover:bg-[#2d8ab8]"
          onClick={() => {
            if (previewSamples.length === 0) return;
            const random = Math.floor(Math.random() * previewSamples.length);
            setIndex(random);
          }}
        >
          Random Sample
        </button>
      </div>

      {!sample || !noisyAndDenoised ? (
        <p className="text-sm text-gray-500">Loading sandbox samples...</p>
      ) : (
        <>
          <p className="text-xs text-gray-500 mb-3">Label: {sample.label}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
                Original
              </p>
              <div className="w-32 h-32 mx-auto border rounded p-1 bg-gray-50">
                <CanvasImage pixels={sample.image} />
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
                {noisyLabel}
              </p>
              <div className="w-32 h-32 mx-auto border rounded p-1 bg-gray-50">
                <CanvasImage pixels={noisyAndDenoised.noisy} />
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
                {denoisedLabel}
              </p>
              <div className="w-32 h-32 mx-auto border rounded p-1 bg-gray-50">
                <CanvasImage pixels={noisyAndDenoised.denoised} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
