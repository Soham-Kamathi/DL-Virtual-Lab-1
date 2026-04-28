"use client";

import React, { useEffect, useState } from "react";

const API_BASE = "http://127.0.0.1:8000";

function toAbsolute(path) {
  if (!path) return "";
  if (path.startsWith("data:")) return path;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_BASE}${path}`;
}

function gaussianRandom() {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export default function ImageComparison({
  modelType,
  images,
  secondaryImages,
  selectedPreset,
  noiseFactor = 0.3,
  latentDim = 64,
}) {
  const isDenoising = modelType === "denoising_autoencoder";
  const [noisyPreview, setNoisyPreview] = useState("");
  const [blendedDenoised, setBlendedDenoised] = useState("");
  const [syntheticReconstruction, setSyntheticReconstruction] = useState("");

  useEffect(() => {
    const originalSrc = images?.original ? toAbsolute(images.original) : "";
    if (!originalSrc) {
      setNoisyPreview("");
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setNoisyPreview("");
        return;
      }

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const noiseScale = Math.max(0, Math.min(1, noiseFactor)) * 255;

      for (let i = 0; i < imageData.data.length; i += 4) {
        const noise = gaussianRandom() * noiseScale;
        imageData.data[i] = Math.max(
          0,
          Math.min(255, imageData.data[i] + noise),
        );
        imageData.data[i + 1] = Math.max(
          0,
          Math.min(255, imageData.data[i + 1] + noise),
        );
        imageData.data[i + 2] = Math.max(
          0,
          Math.min(255, imageData.data[i + 2] + noise),
        );
      }

      ctx.putImageData(imageData, 0, 0);
      setNoisyPreview(canvas.toDataURL("image/png"));
    };
    img.onerror = () => setNoisyPreview("");
    img.src = originalSrc;
  }, [images?.original, noiseFactor]);

  useEffect(() => {
    const alpha = selectedPreset?.blend_alpha;
    const primaryDenoised = images?.denoised ? toAbsolute(images.denoised) : "";
    const secondaryDenoised = secondaryImages?.denoised
      ? toAbsolute(secondaryImages.denoised)
      : "";

    if (
      typeof alpha !== "number" ||
      alpha <= 0 ||
      !primaryDenoised ||
      !secondaryDenoised
    ) {
      setBlendedDenoised("");
      return;
    }

    const imgA = new Image();
    const imgB = new Image();
    imgA.crossOrigin = "anonymous";
    imgB.crossOrigin = "anonymous";

    let loaded = 0;
    const tryBlend = () => {
      loaded += 1;
      if (loaded < 2) return;

      const width = Math.min(imgA.width, imgB.width);
      const height = Math.min(imgA.height, imgB.height);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setBlendedDenoised("");
        return;
      }

      ctx.drawImage(imgA, 0, 0, width, height);
      const dataA = ctx.getImageData(0, 0, width, height);

      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(imgB, 0, 0, width, height);
      const dataB = ctx.getImageData(0, 0, width, height);

      const mixed = ctx.createImageData(width, height);
      for (let i = 0; i < mixed.data.length; i += 1) {
        mixed.data[i] = Math.max(
          0,
          Math.min(
            255,
            Math.round(dataA.data[i] * (1.0 - alpha) + dataB.data[i] * alpha),
          ),
        );
      }

      ctx.putImageData(mixed, 0, 0);
      setBlendedDenoised(canvas.toDataURL("image/png"));
    };

    imgA.onload = tryBlend;
    imgB.onload = tryBlend;
    imgA.onerror = () => setBlendedDenoised("");
    imgB.onerror = () => setBlendedDenoised("");
    imgA.src = primaryDenoised;
    imgB.src = secondaryDenoised;
  }, [
    images?.denoised,
    secondaryImages?.denoised,
    selectedPreset?.blend_alpha,
  ]);

  useEffect(() => {
    if (isDenoising) {
      setSyntheticReconstruction("");
      return;
    }

    const baseReconstruction = images?.denoised
      ? toAbsolute(images.denoised)
      : "";
    const noisyInput =
      noisyPreview || (images?.noisy ? toAbsolute(images.noisy) : "");

    if (!baseReconstruction || !noisyInput) {
      setSyntheticReconstruction("");
      return;
    }

    const modelStrength =
      {
        vanilla_autoencoder: 0.6,
        sparse_autoencoder: 0.65,
        conv_autoencoder: 0.78,
      }[modelType] ?? 0.62;

    const latentNorm = (clamp(latentDim, 16, 512) - 16) / (512 - 16);
    const noiseNorm = clamp(noiseFactor, 0, 1);
    const quality = clamp(
      modelStrength + 0.28 * latentNorm - 0.35 * noiseNorm,
      0.1,
      0.95,
    );

    const imgA = new Image();
    const imgB = new Image();
    imgA.crossOrigin = "anonymous";
    imgB.crossOrigin = "anonymous";

    let loaded = 0;
    const tryCompose = () => {
      loaded += 1;
      if (loaded < 2) return;

      const width = Math.min(imgA.width, imgB.width);
      const height = Math.min(imgA.height, imgB.height);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setSyntheticReconstruction("");
        return;
      }

      ctx.drawImage(imgA, 0, 0, width, height);
      const reconData = ctx.getImageData(0, 0, width, height);

      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(imgB, 0, 0, width, height);
      const noisyData = ctx.getImageData(0, 0, width, height);

      const mixed = ctx.createImageData(width, height);
      for (let i = 0; i < mixed.data.length; i += 1) {
        mixed.data[i] = Math.max(
          0,
          Math.min(
            255,
            Math.round(
              reconData.data[i] * quality + noisyData.data[i] * (1.0 - quality),
            ),
          ),
        );
      }

      ctx.putImageData(mixed, 0, 0);
      setSyntheticReconstruction(canvas.toDataURL("image/png"));
    };

    imgA.onload = tryCompose;
    imgB.onload = tryCompose;
    imgA.onerror = () => setSyntheticReconstruction("");
    imgB.onerror = () => setSyntheticReconstruction("");
    imgA.src = baseReconstruction;
    imgB.src = noisyInput;
  }, [
    isDenoising,
    modelType,
    images?.denoised,
    images?.noisy,
    noisyPreview,
    noiseFactor,
    latentDim,
  ]);

  const effectiveNoisySource = noisyPreview || images?.noisy;
  const effectiveDenoisedSource = isDenoising
    ? blendedDenoised || images?.denoised
    : syntheticReconstruction || images?.denoised;
  const noisyTitle = isDenoising
    ? "Noisy Input (Live Preview)"
    : "Noisy Input/Target (Live Preview)";
  const reconstructedTitle = isDenoising
    ? "Denoised (Target: Clean)"
    : "Reconstructed (Target: Noisy)";

  const cards = [
    { key: "original", title: "Original", src: images?.original },
    { key: "noisy", title: noisyTitle, src: effectiveNoisySource },
    {
      key: "denoised",
      title: reconstructedTitle,
      src: effectiveDenoisedSource,
    },
  ];

  return (
    <div className="bg-white border rounded-lg p-5">
      <h4 className="font-semibold text-gray-700 mb-4">Image Comparison</h4>
      <p className="text-xs text-gray-500 mb-3">
        {isDenoising
          ? "Noisy preview follows the slider and denoised output is driven by preset interpolation."
          : "Noisy preview and reconstructed output both react to current noise and latent settings for visual comparison."}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-1 gap-4">
        {cards.map((card) => (
          <div key={card.key} className="text-center">
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">
              {card.title}
            </p>
            {card.src ? (
              <img
                src={toAbsolute(card.src)}
                alt={card.title}
                className="w-full max-w-44 mx-auto aspect-square object-contain border rounded bg-gray-50 [image-rendering:pixelated]"
                onError={(e) => {
                  e.currentTarget.src = card.src;
                }}
              />
            ) : (
              <div className="w-full max-w-44 mx-auto aspect-square border rounded bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                Not available
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
