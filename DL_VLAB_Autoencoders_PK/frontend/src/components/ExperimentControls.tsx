"use client";

import React from "react";

type Params = {
  model_type: string;
  noise_factor: number;
  latent_dim: number;
};

type Props = {
  params: Params;
  models: string[];
  medicalMode: boolean;
  loading: boolean;
  onParamsChange: (next: Params) => void;
  onMedicalModeChange: (enabled: boolean) => void;
  onRun: () => void;
};

export default function ExperimentControls({
  params,
  models,
  medicalMode,
  loading,
  onParamsChange,
  onMedicalModeChange,
  onRun,
}: Props) {
  return (
    <div className="lab-card sticky top-24">
      <h3 className="text-lg font-semibold border-b pb-2 mb-4">
        Experiment Controls
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Model</label>
          <select
            className="w-full border rounded p-2 text-sm"
            value={params.model_type}
            onChange={(e) =>
              onParamsChange({ ...params, model_type: e.target.value })
            }
          >
            {models.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
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
              onParamsChange({
                ...params,
                noise_factor: parseFloat(e.target.value),
              })
            }
          />
          <div className="flex justify-between text-[10px] text-gray-400">
            <span>0.00</span>
            <span>1.00</span>
          </div>
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
              onParamsChange({
                ...params,
                latent_dim: parseInt(e.target.value, 10),
              })
            }
          />
          <div className="flex justify-between text-[10px] text-gray-400">
            <span>16</span>
            <span>512</span>
          </div>
        </div>

        <label className="flex items-center justify-between rounded border border-gray-200 px-3 py-2 bg-gray-50">
          <span className="text-sm font-medium text-gray-700">
            Medical Imaging Mode
          </span>
          <button
            type="button"
            onClick={() => onMedicalModeChange(!medicalMode)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              medicalMode ? "bg-[#3399cc]" : "bg-gray-300"
            }`}
            aria-pressed={medicalMode}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                medicalMode ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </label>

        <button
          onClick={onRun}
          disabled={loading}
          className={`w-full py-3 rounded-md font-bold text-white transition-all shadow-sm ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#ff6600] hover:bg-[#e65c00]"
          }`}
        >
          {loading ? "RUNNING..." : "Run Simulation"}
        </button>
      </div>
    </div>
  );
}
