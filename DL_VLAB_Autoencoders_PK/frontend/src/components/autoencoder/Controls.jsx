"use client";

import React from "react";

const MODEL_LABELS = {
  vanilla_autoencoder: "Vanilla Autoencoder",
  denoising_autoencoder: "Denoising Autoencoder",
  sparse_autoencoder: "Sparse Autoencoder",
  conv_autoencoder: "Convolutional Autoencoder",
};

export default function Controls({
  models,
  params,
  loading,
  simulationStage,
  selectedPreset,
  onChange,
  onRun,
}) {
  const isDenoising = params.model_type === "denoising_autoencoder";
  const highNoise = params.noise_factor >= 0.35;
  const highLatent = params.latent_dim >= 192;

  return (
    <div className="lab-card sticky top-24">
      <h3 className="text-lg font-semibold mb-4 border-b pb-2">
        Experiment Controls
      </h3>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1">Model</label>
          <select
            className="w-full border rounded p-2 text-sm"
            value={params.model_type}
            onChange={(e) =>
              onChange({ ...params, model_type: e.target.value })
            }
          >
            {models.map((m) => (
              <option key={m} value={m}>
                {MODEL_LABELS[m] || m}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-gray-500">
            Compare reconstruction behavior across all supported autoencoder
            families.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Noise Factor:{" "}
            <span className="text-[#ff6600] font-bold">
              {params.noise_factor.toFixed(2)}
            </span>
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            className="w-full accent-[#ff6600]"
            value={params.noise_factor}
            onChange={(e) =>
              onChange({ ...params, noise_factor: parseFloat(e.target.value) })
            }
          />
          <div className="flex justify-between text-[10px] text-gray-400">
            <span>0.00</span>
            <span>1.00</span>
          </div>
          <p
            className={`mt-2 text-xs rounded px-2 py-1 border ${
              {
                true: "bg-amber-50 text-amber-700 border-amber-200",
                false: "bg-emerald-50 text-emerald-700 border-emerald-200",
              }[String(highNoise)]
            }`}
          >
            {isDenoising
              ? highNoise
                ? "Denoising mode: higher noise makes clean reconstruction harder"
                : "Denoising mode: lower noise usually improves quality"
              : highNoise
                ? "Noisy-to-noisy mode: stronger corruption increases reconstruction difficulty"
                : "Noisy-to-noisy mode: mild corruption keeps structure easier to reconstruct"}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Latent Dimension:{" "}
            <span className="text-[#3399cc] font-bold">
              {params.latent_dim}
            </span>
          </label>
          <input
            type="range"
            min="16"
            max="512"
            step="16"
            className="w-full accent-[#3399cc]"
            value={params.latent_dim}
            onChange={(e) =>
              onChange({ ...params, latent_dim: parseInt(e.target.value, 10) })
            }
          />
          <div className="flex justify-between text-[10px] text-gray-400">
            <span>16</span>
            <span>512</span>
          </div>
          <p
            className={`mt-2 text-xs rounded px-2 py-1 border ${
              {
                true: "bg-sky-50 text-sky-700 border-sky-200",
                false: "bg-gray-50 text-gray-700 border-gray-200",
              }[String(highLatent)]
            }`}
          >
            {highLatent
              ? "Larger bottleneck capacity preserves more feature detail"
              : "Smaller bottleneck enforces stronger compression"}
          </p>
        </div>

        <div className="rounded border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-700">
          {isDenoising
            ? "Training behavior: noisy input -> clean target"
            : "Training behavior: noisy input -> noisy target"}
        </div>

        {loading && simulationStage ? (
          <div className="rounded border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-800">
            {simulationStage}
          </div>
        ) : null}

        {selectedPreset ? (
          <div className="rounded border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-700">
            Matched preset: noise={selectedPreset.noise_factor}, latent=
            {selectedPreset.latent_dim}
          </div>
        ) : null}

        <button
          onClick={onRun}
          disabled={loading}
          className={`w-full py-3 rounded-md font-bold text-white transition-all shadow-sm ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#ff6600] hover:bg-[#e65c00]"
          }`}
        >
          {loading ? "Running Simulation..." : "Run Simulation"}
        </button>
      </div>
    </div>
  );
}
