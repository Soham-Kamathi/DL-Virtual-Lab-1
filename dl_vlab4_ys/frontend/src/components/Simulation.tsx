/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { getPreview, runSimulationStream } from "@/lib/api";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

export default function Simulation() {
  const [params, setParams] = useState({
    model_capacity: "Low",
    dropout: 0.0,
    solver: "adam",
    alpha: 0.0001,
    batch_size: 32,
    epochs: 15,
    learning_rate: 0.001,
    dataset: "cifar-10",
  });

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Live training state
  const [logs, setLogs] = useState<string[]>([]);
  const [liveEpoch, setLiveEpoch] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadPreview();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.dataset]);

  const loadPreview = async () => {
    try {
      setError(null);
      const data = await getPreview(params.dataset, 16);
      if (data?.samples) setPreview(data.samples);
    } catch (err: any) {
      const detail = err.response?.data?.detail || err.message;
      // Fail gracefully if backend is not running
      setError(detail || "Failed to load CIFAR-10 preview. Please start the backend server.");
    }
  };

  const handleRun = async () => {
    setLoading(true);
    setResults(null);
    setError(null);
    setLogs([]);
    setLiveEpoch(null);
    setProgress(0);

    try {
      await runSimulationStream(params, (event) => {
        if (event.type === "log") {
          setLogs((prev) => [...prev, event.message]);
        } else if (event.type === "epoch") {
          setLiveEpoch(event);
          setProgress(Math.round((event.epoch / event.total_epochs) * 100));
        } else if (event.type === "result") {
          setResults(event);
          setProgress(100);
        }
      });
    } catch (err: any) {
      const detail = err.message || "Training failed.";
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  const classLabels = results?.class_labels || ["airplane", "automobile", "bird", "cat", "deer", "dog", "frog", "horse", "ship", "truck"];

  // Helper to draw realistic CIFAR-10 image (assumes 32x32 RGB from backend, given as array of len 3072 [R..R, G..G, B..B] or [RGBRGB...])
  const drawCifarImage = (canvas: HTMLCanvasElement | null, pixelData: number[]) => {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const imgData = ctx.createImageData(32, 32);
    
    // Check if flat array or nested. Assume backend passes flat array of size 3072.
    // If format is [r,g,b, r,g,b...]:
    if (pixelData.length === 3072) {
      // standard pixel layout from PyTorch is usually [Channels, Height, Width] -> [3, 32, 32]
      // meaning first 1024 are R, next 1024 are G, next 1024 are B.
      for (let i = 0; i < 1024; i++) {
        imgData.data[i * 4] = pixelData[i] * 255;             // R
        imgData.data[i * 4 + 1] = pixelData[1024 + i] * 255;  // G
        imgData.data[i * 4 + 2] = pixelData[2048 + i] * 255;  // B
        imgData.data[i * 4 + 3] = 255;                        // Alpha
      }
    } else {
      // Fallback if data is grayscale or weird mapping
      for (let i = 0; i < 1024; i++) {
        const val = (pixelData[i] || 0) * 255;
        imgData.data[i * 4] = val;
        imgData.data[i * 4 + 1] = val;
        imgData.data[i * 4 + 2] = val;
        imgData.data[i * 4 + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);
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
        <h3 className="text-xl font-bold mb-4 border-b pb-2">CNN Simulation Parameters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

          {/* Dataset */}
          <div>
            <label className="block text-sm font-medium mb-1">Dataset</label>
            <select className="w-full border rounded p-2 text-sm bg-gray-50 cursor-not-allowed"
              value={params.dataset} disabled>
              <option value="cifar-10">CIFAR-10</option>
            </select>
          </div>

          {/* Model Capacity */}
          <div>
            <label className="block text-sm font-medium mb-1">Model Capacity</label>
            <select className="w-full border rounded p-2 text-sm"
              value={params.model_capacity}
              onChange={(e) => setParams({ ...params, model_capacity: e.target.value })}>
              <option value="Low">Low (Fewer Conv layers)</option>
              <option value="Medium">Medium</option>
              <option value="High">High (Deep CNN)</option>
            </select>
          </div>

          {/* Dropout Rate */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Dropout Rate: <span className="text-[#ff6600] font-bold">{params.dropout}</span>
            </label>
            <input type="range" min="0" max="0.7" step="0.1" className="w-full accent-[#ff6600]"
              value={params.dropout}
              onChange={(e) => setParams({ ...params, dropout: parseFloat(e.target.value) })} />
            <div className="flex justify-between text-[10px] text-gray-400"><span>0.0</span><span>0.7</span></div>
          </div>

          {/* Alpha (Weight Decay) */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Weight Decay: <span className="text-[#ff6600] font-bold">{params.alpha}</span>
            </label>
            <input type="range" min="0.0" max="0.1" step="0.001" className="w-full accent-[#ff6600]"
              value={params.alpha}
              onChange={(e) => setParams({ ...params, alpha: parseFloat(e.target.value) })} />
            <div className="flex justify-between text-[10px] text-gray-400"><span>0.0</span><span>0.1</span></div>
          </div>

          {/* Optimizer */}
          <div>
            <label className="block text-sm font-medium mb-1">Optimizer</label>
            <select className="w-full border rounded p-2 text-sm"
              value={params.solver}
              onChange={(e) => setParams({ ...params, solver: e.target.value })}>
              <option value="adam">Adam</option>
              <option value="sgd">SGD (momentum)</option>
            </select>
          </div>

          {/* Batch Size */}
          <div>
            <label className="block text-sm font-medium mb-1">Batch Size</label>
            <select className="w-full border rounded p-2 text-sm"
              value={params.batch_size}
              onChange={(e) => setParams({ ...params, batch_size: parseInt(e.target.value) })}>
              <option value={16}>16</option>
              <option value={32}>32</option>
              <option value={64}>64</option>
              <option value={128}>128</option>
            </select>
          </div>

          {/* Epochs */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Epochs: <span className="text-[#ff6600] font-bold">{params.epochs}</span>
            </label>
            <input type="range" min="1" max="50" step="1" className="w-full accent-[#ff6600]"
              value={params.epochs}
              onChange={(e) => setParams({ ...params, epochs: parseInt(e.target.value) })} />
            <div className="flex justify-between text-[10px] text-gray-400"><span>1</span><span>50</span></div>
          </div>

          {/* Learning Rate */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Learning Rate: <span className="text-[#ff6600] font-bold">{params.learning_rate}</span>
            </label>
            <input type="range" min="0.0001" max="0.1" step="0.001" className="w-full accent-[#ff6600]"
              value={params.learning_rate}
              onChange={(e) => setParams({ ...params, learning_rate: parseFloat(e.target.value) })} />
            <div className="flex justify-between text-[10px] text-gray-400"><span>0.0001</span><span>0.1</span></div>
          </div>
        </div>

        {/* Run Button */}
        <button onClick={handleRun} disabled={loading}
          className={`mt-6 w-full py-4 rounded-md font-bold text-white transition-all shadow-sm ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#ff6600] hover:bg-[#e65c00]"
          }`}>
          {loading ? "TRAINING & EVALUATING..." : "\u25B6 RUN OVERFITTING EXPERIMENT"}
        </button>

        {/* Progress Bar */}
        {loading && (
          <div className="mt-3 w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div className="bg-[#ff6600] h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>

      {/* ─── Live Training Log Console ─── */}
      {logs.length > 0 && (
        <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
          <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${loading ? "bg-green-400 animate-pulse" : "bg-gray-500"}`} />
              <span className="text-xs text-gray-300 font-mono uppercase tracking-wider">Training Console</span>
            </div>
            {liveEpoch && (
              <span className="text-xs text-gray-400 font-mono">
                Epoch {liveEpoch.epoch}/{liveEpoch.total_epochs} | Train Loss: {liveEpoch.loss} | Val Loss: {liveEpoch.val_loss || "N/A"} | Train Acc: {(liveEpoch.accuracy * 100).toFixed(1)}% | Val Acc: {(liveEpoch.val_accuracy * 100).toFixed(1)}%
              </span>
            )}
          </div>
          <div className="p-4 max-h-48 overflow-y-auto font-mono text-xs leading-relaxed">
            {logs.map((log, i) => (
              <div key={i} className="text-green-400 py-0.5 whitespace-pre-wrap">
                <span className="text-gray-500 mr-2">[{String(i + 1).padStart(3, "0")}]</span>
                {log}
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        </div>
      )}

      {/* ─── Dataset Preview ─── */}
      <div className="bg-white border rounded-sm p-8">
        <h3 className="text-xl text-[#3399cc] font-light mb-6 border-b pb-2 uppercase tracking-wide">
          Dataset Preview (CIFAR-10)
        </h3>
        {preview.length === 0 && !error && (
          <p className="text-center text-gray-400 text-sm py-6">Loading preview...</p>
        )}
        <div className="grid grid-cols-4 md:grid-cols-8 gap-6 justify-items-center">
          {preview.map((sample, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="w-16 h-16 border bg-gray-50 flex items-center justify-center p-1 rounded-sm shadow-sm">
                <canvas width="32" height="32"
                  className="w-full h-full [image-rendering:pixelated]"
                  ref={(el) => drawCifarImage(el, sample.image)}
                />
              </div>
              <span className="text-[10px] text-gray-500 font-mono">{sample.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Live Training Charts (update during training) ─── */}
      {(liveEpoch || results) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Training vs Validation Loss Curve */}
          <div className="bg-white border p-6">
            <h3 className="text-xl text-[#3399cc] font-light mb-4 border-b pb-2 uppercase tracking-wide">
              Loss: Training vs Validation
            </h3>
            <Plot
              data={[
                {
                  name: "Train Loss",
                  x: Array.from({ length: (results?.loss_curve || liveEpoch?.loss_curve || []).length }, (_, i) => i + 1),
                  y: results?.loss_curve || liveEpoch?.loss_curve || [],
                  type: "scatter", mode: "lines+markers",
                  marker: { color: "#ff6600", size: 5 },
                  line: { color: "#ff6600", width: 2 },
                },
                {
                  name: "Val Loss",
                  x: Array.from({ length: (results?.val_loss_curve || liveEpoch?.val_loss_curve || []).length }, (_, i) => i + 1),
                  y: results?.val_loss_curve || liveEpoch?.val_loss_curve || [],
                  type: "scatter", mode: "lines+markers",
                  marker: { color: "#e62e00", size: 5, symbol: "triangle-up" },
                  line: { color: "#e62e00", width: 2, dash: "dot" },
                }
              ]}
              layout={{
                autosize: true,
                margin: { t: 10, r: 10, b: 40, l: 50 },
                xaxis: { title: "Epoch" },
                yaxis: { title: "Loss" },
                font: { family: "Segoe UI, Roboto" },
                legend: { orientation: "h", y: -0.2 }
              }}
              useResizeHandler style={{ width: "100%", height: "300px" }}
            />
          </div>

          {/* Training vs Validation Accuracy Curve */}
          <div className="bg-white border p-6">
            <h3 className="text-xl text-[#3399cc] font-light mb-4 border-b pb-2 uppercase tracking-wide">
              Accuracy: Training vs Validation
            </h3>
            <Plot
              data={[
                {
                  name: "Train Acc",
                  x: Array.from({ length: (results?.accuracy_curve || liveEpoch?.accuracy_curve || []).length }, (_, i) => i + 1),
                  y: (results?.accuracy_curve || liveEpoch?.accuracy_curve || []).map((v: number) => v * 100),
                  type: "scatter", mode: "lines+markers",
                  marker: { color: "#3399cc", size: 5 },
                  line: { color: "#3399cc", width: 2 },
                },
                {
                  name: "Val Acc",
                  x: Array.from({ length: (results?.val_accuracy_curve || liveEpoch?.val_accuracy_curve || []).length }, (_, i) => i + 1),
                  y: (results?.val_accuracy_curve || liveEpoch?.val_accuracy_curve || []).map((v: number) => v * 100),
                  type: "scatter", mode: "lines+markers",
                  marker: { color: "#2E5E8A", size: 5, symbol: "triangle-up" },
                  line: { color: "#2E5E8A", width: 2, dash: "dot" },
                }
              ]}
              layout={{
                autosize: true,
                margin: { t: 10, r: 10, b: 40, l: 50 },
                xaxis: { title: "Epoch" },
                yaxis: { title: "Accuracy (%)", range: [0, 100] },
                font: { family: "Segoe UI, Roboto" },
                legend: { orientation: "h", y: -0.2 }
              }}
              useResizeHandler style={{ width: "100%", height: "300px" }}
            />
          </div>
        </div>
      )}

      {/* ─── Final Results (only after training completes) ─── */}
      {results && (
        <div className="space-y-8">
          {/* Accuracy Gap Callout */}
          <div className="bg-white border p-6 flex flex-col items-center justify-center">
            <h3 className="text-xl text-[#3399cc] font-light mb-4 border-b pb-2 uppercase tracking-wide w-full text-center">
              Overfitting Analysis
            </h3>
            <div className="grid grid-cols-2 gap-12 text-center py-6">
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase">Training Accuracy</p>
                <span className="text-5xl font-light text-[#3399cc]">
                  {((liveEpoch?.accuracy || 0) * 100).toFixed(1)}%
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase">Test Accuracy</p>
                <span className={`text-5xl font-light ${(liveEpoch?.val_accuracy || 0) < (liveEpoch?.accuracy || 0) - 0.1 ? 'text-red-500' : 'text-green-500'}`}>
                  {((liveEpoch?.val_accuracy || 0) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2 bg-gray-50 px-4 py-2 border rounded-md">
              <strong>Accuracy Gap:</strong> {(((liveEpoch?.accuracy || 0) - (liveEpoch?.val_accuracy || 0)) * 100).toFixed(1)}% 
              { ((liveEpoch?.accuracy || 0) - (liveEpoch?.val_accuracy || 0)) > 0.15 ? " (Significant overfit detected)" : " (Good generalization)" }
            </p>
            <p className="text-xs text-gray-400 mt-6 uppercase tracking-[0.2em]">
              Trained in {results.training_time}s
            </p>
          </div>

          {/* Dynamic Confusion Matrix */}
          <div className="bg-white border p-6">
            <h3 className="text-xl text-[#3399cc] font-light mb-4 border-b pb-2 uppercase tracking-wide">
              Confusion Matrix (Test Set)
            </h3>
            <Plot
              data={[{
                z: results.confusion_matrix,
                x: classLabels,
                y: classLabels,
                type: "heatmap",
                colorscale: [[0, "white"], [1, "#3399cc"]],
                showscale: true,
                texttemplate: "%{z}",
              }]}
              layout={{
                autosize: true,
                margin: { t: 10, r: 10, b: 60, l: 80 },
                xaxis: { title: "Predicted Label", dtick: 1 },
                yaxis: { title: "Actual Label", dtick: 1, autorange: "reversed" },
                font: { family: "Segoe UI, Roboto" },
              }}
              useResizeHandler style={{ width: "100%", height: "450px" }}
            />
          </div>

          {/* Prediction Sandbox */}
          <div className="bg-white border p-6">
            <h3 className="text-xl text-[#3399cc] font-light mb-6 border-b pb-2 uppercase tracking-wide">
              Prediction Sandbox
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
              {results.predictions.map((p: any, i: number) => (
                <div key={i} className="border p-4 rounded-sm flex flex-col items-center hover:shadow-lg transition-all bg-gray-50/50">
                  <canvas width="32" height="32"
                    className="w-20 h-20 border bg-black shadow-inner mb-3 [image-rendering:pixelated]"
                    ref={(el) => drawCifarImage(el, p.image)}
                  />
                  <div className="text-center">
                    <p className="text-xs uppercase tracking-tight text-gray-400">Predicted</p>
                    <p className={`text-xl font-bold ${p.predicted === p.actual ? "text-green-600" : "text-red-500"}`}>
                      {p.predicted}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Actual: {p.actual}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
