"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { runExperiment, getModels, getPreview } from "@/lib/noiseReductionApi";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

export default function NoiseReductionSimulation() {
  const [models, setModels] = useState<string[]>(["denoising_autoencoder"]);
  const [params, setParams] = useState({
    model_type: "denoising_autoencoder",
    noise_factor: 0.5,
    latent_dim: 64,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Results
  const [metrics, setMetrics] = useState<any>(null);
  const [images, setImages] = useState<any>(null);

  // Preview
  const [preview, setPreview] = useState<any[]>([]);

  const loadPreview = async () => {
    try {
      setError(null);
      const data = await getPreview("Fashion-MNIST", 16);
      if (data?.samples) setPreview(data.samples);
    } catch (err: any) {
      console.error("Failed to load dataset preview:", err);
      // Let the user know the preview specifically failed
      setError(
        err.message ||
          "Failed to connect to the backend to fetch Dataset Previews.",
      );
    }
  };

  useEffect(() => {
    // Fetch available models on load
    const fetchModels = async () => {
      try {
        const availableModels = await getModels();
        if (availableModels && availableModels.length > 0) {
          setModels(availableModels);
          setParams((prev) => ({ ...prev, model_type: availableModels[0] }));
        }
      } catch (err: any) {
        console.error("Failed to fetch models:", err);
        // Fallback to "Denoising Autoencoder" if fail
      }
    };
    fetchModels();
    loadPreview();
  }, []);

  const handleRun = async () => {
    setLoading(true);
    setError(null);
    setMetrics(null);
    setImages(null);

    try {
      const response = await runExperiment({
        model_type: params.model_type,
        // Optional params that the backend may or may not support currently
        noise_factor: params.noise_factor,
        latent_dim: params.latent_dim,
      });

      if (response && response.status === "success") {
        setMetrics(response.metrics);
        setImages(response.images);
      } else {
        throw new Error(response?.detail || "Experiment failed.");
      }
    } catch (err: any) {
      const detail =
        err.response?.data?.detail ||
        err.message ||
        "Failed to run simulation.";
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-sm">
          <h3 className="text-base font-medium text-red-800">Error</h3>
          <p className="mt-1 text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* ─── Control Panel ─── */}
      <div className="lab-card">
        <h3 className="text-xl font-bold mb-4 border-b pb-2">
          Simulation Parameters
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Model Selection */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Model Architecture
            </label>
            <select
              className="w-full border rounded p-2 text-sm"
              value={params.model_type}
              onChange={(e) =>
                setParams({ ...params, model_type: e.target.value })
              }
            >
              {models.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Noise Factor */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Noise Factor:{" "}
              <span className="text-[#ff6600] font-bold">
                {params.noise_factor.toFixed(2)}
              </span>
            </label>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.1"
              className="w-full accent-[#ff6600]"
              value={params.noise_factor}
              onChange={(e) =>
                setParams({
                  ...params,
                  noise_factor: parseFloat(e.target.value),
                })
              }
            />
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>0.1 (Low)</span>
              <span>1.0 (High)</span>
            </div>
          </div>

          {/* Latent Dimension */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Latent Dimension:{" "}
              <span className="text-[#ff6600] font-bold">
                {params.latent_dim}
              </span>
            </label>
            <input
              type="range"
              min="16"
              max="256"
              step="16"
              className="w-full accent-[#ff6600]"
              value={params.latent_dim}
              onChange={(e) =>
                setParams({ ...params, latent_dim: parseInt(e.target.value) })
              }
            />
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>16</span>
              <span>256</span>
            </div>
          </div>
        </div>

        {/* Run Button */}
        <button
          onClick={handleRun}
          disabled={loading}
          className={`mt-6 w-full py-4 rounded-md font-bold text-white transition-all shadow-sm ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#ff6600] hover:bg-[#e65c00]"
          }`}
        >
          {loading ? "RUNNING SIMULATION..." : "▶ RUN SIMULATION"}
        </button>
      </div>

      {/* ─── Dataset Preview ─── */}
      <div className="bg-white border rounded-sm p-8">
        <h3 className="text-xl text-[#3399cc] font-light mb-6 border-b pb-2 uppercase tracking-wide">
          Dataset Preview
        </h3>
        {preview.length === 0 && !error && (
          <p className="text-center text-gray-400 text-sm py-6">
            Loading preview...
          </p>
        )}
        {preview.length === 0 && error && (
          <p className="text-center text-red-400 text-sm py-6">
            Could not load dataset: {error}
          </p>
        )}
        <div className="grid grid-cols-4 md:grid-cols-8 gap-6 justify-items-center">
          {preview.map((sample, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="w-20 h-20 border bg-gray-50 flex items-center justify-center p-1 rounded-sm shadow-sm">
                <canvas
                  width="28"
                  height="28"
                  className="w-full h-full [image-rendering:pixelated]"
                  ref={(el) => {
                    if (!el) return;
                    const ctx = el.getContext("2d");
                    if (!ctx) return;
                    const imgData = ctx.createImageData(28, 28);
                    for (let j = 0; j < 784; j++) {
                      const val = sample.image[j] * 255;
                      imgData.data[j * 4] = val;
                      imgData.data[j * 4 + 1] = val;
                      imgData.data[j * 4 + 2] = val;
                      imgData.data[j * 4 + 3] = 255;
                    }
                    ctx.putImageData(imgData, 0, 0);
                  }}
                />
              </div>
              <span className="text-[10px] text-gray-500 font-mono">
                {sample.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Results Dashboard ─── */}
      {metrics && (
        <div className="space-y-8">
          <h3 className="text-xl text-[#3399cc] font-light border-b pb-2 uppercase tracking-wide">
            Metrics Dashboard
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Loss Curve */}
            <div className="bg-white border p-6">
              <h4 className="font-semibold text-gray-700 mb-4 text-center">
                Training & Validation Loss
              </h4>
              <Plot
                data={[
                  {
                    x: metrics.epochs,
                    y: metrics.train_loss,
                    type: "scatter",
                    mode: "lines+markers",
                    name: "Train Loss",
                    marker: { color: "#ff6600", size: 5 },
                    line: { color: "#ff6600", width: 2 },
                  },
                  {
                    x: metrics.epochs,
                    y: metrics.val_loss,
                    type: "scatter",
                    mode: "lines+markers",
                    name: "Val Loss",
                    marker: { color: "#3399cc", size: 5 },
                    line: { color: "#3399cc", width: 2 },
                  },
                ]}
                layout={{
                  autosize: true,
                  margin: { t: 10, r: 10, b: 40, l: 50 },
                  xaxis: { title: "Epoch" },
                  yaxis: { title: "Loss" },
                  legend: { orientation: "h", y: -0.2 },
                  font: { family: "Segoe UI, Roboto" },
                }}
                useResizeHandler
                style={{ width: "100%", height: "300px" }}
              />
            </div>

            {/* Evaluation Metrics Cards */}
            <div className="flex flex-col gap-4 justify-center items-center h-full">
              <div className="bg-white border p-6 rounded shadow-sm w-full text-center">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">
                  Average PSNR
                </p>
                <p className="text-5xl font-light text-[#ff6600] mt-2">
                  {metrics.psnr && metrics.psnr.length > 0
                    ? metrics.psnr[metrics.psnr.length - 1].toFixed(2)
                    : "N/A"}{" "}
                  <span className="text-lg text-gray-400">dB</span>
                </p>
              </div>
              <div className="bg-white border p-6 rounded shadow-sm w-full text-center">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">
                  Average SSIM
                </p>
                <p className="text-5xl font-light text-[#3399cc] mt-2">
                  {metrics.ssim && metrics.ssim.length > 0
                    ? metrics.ssim[metrics.ssim.length - 1].toFixed(4)
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Image Comparison ─── */}
      {images && Object.keys(images).length > 0 && (
        <div className="space-y-8">
          <h3 className="text-xl text-[#3399cc] font-light border-b pb-2 uppercase tracking-wide">
            Image Comparison Results
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white border p-8 rounded-sm">
            {/* Original */}
            {images.original && (
              <div className="flex flex-col items-center">
                <p className="font-semibold text-gray-600 mb-4 tracking-wider uppercase text-sm">
                  Original Image
                </p>
                <img
                  src={`http://localhost:8000${images.original}`}
                  alt="Original"
                  className="w-full max-w-[200px] border shadow-sm aspect-square object-contain bg-gray-50 [image-rendering:pixelated]"
                  onError={(e) => (e.currentTarget.src = images.original)}
                />
              </div>
            )}

            {/* Noisy */}
            {images.noisy && (
              <div className="flex flex-col items-center">
                <p className="font-semibold text-gray-600 mb-4 tracking-wider uppercase text-sm">
                  Noisy Image
                </p>
                <img
                  src={`http://localhost:8000${images.noisy}`}
                  alt="Noisy"
                  className="w-full max-w-[200px] border shadow-sm aspect-square object-contain bg-gray-50 [image-rendering:pixelated]"
                  onError={(e) => (e.currentTarget.src = images.noisy)}
                />
              </div>
            )}

            {/* Denoised */}
            {images.denoised && (
              <div className="flex flex-col items-center">
                <p className="font-semibold text-[#3399cc] mb-4 tracking-wider uppercase text-sm">
                  Denoised Image
                </p>
                <img
                  src={`http://localhost:8000${images.denoised}`}
                  alt="Denoised"
                  className="w-full max-w-[200px] border shadow-sm aspect-square object-contain bg-gray-50 [image-rendering:pixelated]"
                  onError={(e) => (e.currentTarget.src = images.denoised)}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
