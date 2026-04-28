"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { getPreview, runSimulationStream } from "@/lib/api";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

export default function Simulation() {
  const [params, setParams] = useState({
    hidden_layers: [128],
    activation: "relu",
    solver: "adam",
    alpha: 0.0001,
    batch_size: 32,
    epochs: 10,
    learning_rate: 0.001,
    dataset: "mnist_784",
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
  }, [params.dataset]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const loadPreview = async () => {
    try {
      setError(null);
      const data = await getPreview(params.dataset, 16);
      if (data?.samples) setPreview(data.samples);
    } catch (err: any) {
      const detail = err.response?.data?.detail || err.message;
      setError(detail || "Failed to load dataset preview.");
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

  // Dynamic confusion matrix labels from results
  const classLabels = results?.class_labels || [];

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
        <h3 className="text-xl font-bold mb-4 border-b pb-2">Simulation Parameters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

          {/* Dataset */}
          <div>
            <label className="block text-sm font-medium mb-1">Dataset</label>
            <select className="w-full border rounded p-2 text-sm"
              value={params.dataset}
              onChange={(e) => setParams({ ...params, dataset: e.target.value })}>
              <option value="mnist_784">MNIST Digits</option>
              <option value="Fashion-MNIST">Fashion MNIST</option>
            </select>
          </div>

          {/* Hidden Units */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Hidden Units: <span className="text-[#ff6600] font-bold">{params.hidden_layers[0]}</span>
            </label>
            <input type="range" min="16" max="512" step="16" className="w-full accent-[#ff6600]"
              value={params.hidden_layers[0]}
              onChange={(e) => setParams({ ...params, hidden_layers: [parseInt(e.target.value)] })} />
            <div className="flex justify-between text-[10px] text-gray-400"><span>16</span><span>512</span></div>
          </div>

          {/* Activation */}
          <div>
            <label className="block text-sm font-medium mb-1">Activation Function</label>
            <select className="w-full border rounded p-2 text-sm"
              value={params.activation}
              onChange={(e) => setParams({ ...params, activation: e.target.value })}>
              <option value="relu">ReLU</option>
              <option value="logistic">Sigmoid</option>
              <option value="tanh">Tanh</option>
              <option value="identity">Identity</option>
            </select>
          </div>

          {/* Optimizer */}
          <div>
            <label className="block text-sm font-medium mb-1">Optimizer</label>
            <select className="w-full border rounded p-2 text-sm"
              value={params.solver}
              onChange={(e) => setParams({ ...params, solver: e.target.value })}>
              <option value="adam">Adam</option>
              <option value="sgd">SGD</option>
              <option value="lbfgs">L-BFGS</option>
            </select>
          </div>

          {/* Alpha (L2 Regularization) */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Alpha (L2): <span className="text-[#ff6600] font-bold">{params.alpha}</span>
            </label>
            <input type="range" min="0.0001" max="1" step="0.0001" className="w-full accent-[#ff6600]"
              value={params.alpha}
              onChange={(e) => setParams({ ...params, alpha: parseFloat(e.target.value) })} />
            <div className="flex justify-between text-[10px] text-gray-400"><span>0.0001</span><span>1.0</span></div>
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
          {loading ? "TRAINING MODEL..." : "\u25B6 RUN SIMULATION"}
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
                Epoch {liveEpoch.epoch}/{liveEpoch.total_epochs} | Loss: {liveEpoch.loss} | Acc: {(liveEpoch.accuracy * 100).toFixed(1)}%
              </span>
            )}
          </div>
          <div className="p-4 max-h-48 overflow-y-auto font-mono text-xs leading-relaxed">
            {logs.map((log, i) => (
              <div key={i} className="text-green-400 py-0.5">
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
          Dataset Preview
        </h3>
        {preview.length === 0 && !error && (
          <p className="text-center text-gray-400 text-sm py-6">Loading preview...</p>
        )}
        <div className="grid grid-cols-4 md:grid-cols-8 gap-6 justify-items-center">
          {preview.map((sample, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="w-20 h-20 border bg-gray-50 flex items-center justify-center p-1 rounded-sm shadow-sm">
                <canvas width="28" height="28"
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
              <span className="text-[10px] text-gray-500 font-mono">{sample.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Live Training Charts (update during training) ─── */}
      {(liveEpoch || results) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Training Loss Curve */}
          <div className="bg-white border p-6">
            <h3 className="text-xl text-[#3399cc] font-light mb-4 border-b pb-2 uppercase tracking-wide">
              Training Loss
            </h3>
            <Plot
              data={[{
                x: Array.from({ length: (results?.loss_curve || liveEpoch?.loss_curve || []).length }, (_, i) => i + 1),
                y: results?.loss_curve || liveEpoch?.loss_curve || [],
                type: "scatter", mode: "lines+markers",
                marker: { color: "#ff6600", size: 5 },
                line: { color: "#ff6600", width: 2 },
              }]}
              layout={{
                autosize: true,
                margin: { t: 10, r: 10, b: 40, l: 50 },
                xaxis: { title: "Epoch" },
                yaxis: { title: "Loss" },
                font: { family: "Segoe UI, Roboto" },
              }}
              useResizeHandler style={{ width: "100%", height: "300px" }}
            />
          </div>

          {/* Accuracy Curve */}
          <div className="bg-white border p-6">
            <h3 className="text-xl text-[#3399cc] font-light mb-4 border-b pb-2 uppercase tracking-wide">
              Accuracy Curve
            </h3>
            <Plot
              data={[{
                x: Array.from({ length: (results?.accuracy_curve || liveEpoch?.accuracy_curve || []).length }, (_, i) => i + 1),
                y: (results?.accuracy_curve || liveEpoch?.accuracy_curve || []).map((v: number) => v * 100),
                type: "scatter", mode: "lines+markers",
                marker: { color: "#3399cc", size: 5 },
                line: { color: "#3399cc", width: 2 },
              }]}
              layout={{
                autosize: true,
                margin: { t: 10, r: 10, b: 40, l: 50 },
                xaxis: { title: "Epoch" },
                yaxis: { title: "Accuracy (%)", range: [0, 100] },
                font: { family: "Segoe UI, Roboto" },
              }}
              useResizeHandler style={{ width: "100%", height: "300px" }}
            />
          </div>
        </div>
      )}

      {/* ─── Final Results (only after training completes) ─── */}
      {results && (
        <div className="space-y-8">
          {/* Accuracy + Training Time */}
          <div className="bg-white border p-6 flex flex-col items-center justify-center">
            <h3 className="text-xl text-[#3399cc] font-light mb-4 border-b pb-2 uppercase tracking-wide w-full text-center">
              Test Accuracy
            </h3>
            <div className="text-center py-8">
              <span className="text-7xl font-light text-[#ff6600]">
                {(results.accuracy * 100).toFixed(2)}%
              </span>
              <p className="text-xs text-gray-400 mt-4 uppercase tracking-[0.2em]">
                Trained in {results.training_time}s
              </p>
            </div>
          </div>

          {/* Dynamic Confusion Matrix */}
          <div className="bg-white border p-6">
            <h3 className="text-xl text-[#3399cc] font-light mb-4 border-b pb-2 uppercase tracking-wide">
              Confusion Matrix
            </h3>
            <Plot
              data={[{
                z: results.confusion_matrix,
                x: classLabels.length > 0 ? classLabels : Array.from({ length: results.confusion_matrix.length }, (_, i) => String(i)),
                y: classLabels.length > 0 ? classLabels : Array.from({ length: results.confusion_matrix.length }, (_, i) => String(i)),
                type: "heatmap",
                colorscale: [[0, "white"], [1, "#3399cc"]],
                showscale: true,
              }]}
              layout={{
                autosize: true,
                margin: { t: 10, r: 10, b: 60, l: 60 },
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
                  <canvas width="28" height="28"
                    className="w-24 h-24 border bg-black shadow-inner mb-3 [image-rendering:pixelated]"
                    ref={(el) => {
                      if (!el) return;
                      const ctx = el.getContext("2d");
                      if (!ctx) return;
                      const imgData = ctx.createImageData(28, 28);
                      for (let j = 0; j < 784; j++) {
                        const val = p.image[j] * 255;
                        imgData.data[j * 4] = val;
                        imgData.data[j * 4 + 1] = val;
                        imgData.data[j * 4 + 2] = val;
                        imgData.data[j * 4 + 3] = 255;
                      }
                      ctx.putImageData(imgData, 0, 0);
                    }}
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
