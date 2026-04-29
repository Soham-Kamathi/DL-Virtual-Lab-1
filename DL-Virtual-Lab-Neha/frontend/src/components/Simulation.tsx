"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

export default function Simulation() {
  const [windowSize, setWindowSize] = useState(120);
  const [lstmLayers, setLstmLayers] = useState(3);
  const [dataset, setDataset] = useState("google");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ mse: string; rmse: string } | null>(null);

  const [lossCurve, setLossCurve] = useState<number[]>([]);
  const [actualPrices, setActualPrices] = useState<number[]>([]);
  const [predictedPrices, setPredictedPrices] = useState<number[]>([]);

  const handleRun = async () => {
    setLoading(true);
    setResults(null);
    try {
      const response = await fetch("http://localhost:8000/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          window_size: windowSize,
          layers: lstmLayers,
          dataset: dataset
        })
      });
      if (!response.ok) {
        throw new Error("Failed to fetch simulation data.");
      }
      const data = await response.json();
      setLossCurve(data.loss_curve);
      setActualPrices(data.actual_prices);
      setPredictedPrices(data.predicted_prices);
      setResults({
        mse: data.mse.toFixed(3),
        rmse: data.rmse.toFixed(3)
      });
    } catch (error) {
      console.error(error);
      alert("Error running simulation. Ensure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* ─── Control Panel (Left) ─── */}
      <div className="w-full lg:w-1/3 space-y-6">
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <h3 className="text-xl font-bold mb-4 border-b pb-2 text-[#3399cc]">Simulation Controls</h3>

          <div className="space-y-5">
            {/* Window Size Slider */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Window Size: <span className="text-[#ff6600] font-bold">{windowSize}</span>
              </label>
              <input
                type="range" min="10" max="200" step="10"
                className="w-full accent-[#ff6600]"
                value={windowSize}
                onChange={(e) => setWindowSize(parseInt(e.target.value))}
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>10</span>
                <span>200</span>
              </div>
            </div>

            {/* LSTM Layers Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">LSTM Layers</label>
              <select
                className="w-full border-gray-300 rounded-md shadow-sm border p-2 text-sm focus:border-[#3399cc] focus:ring focus:ring-[#3399cc] focus:ring-opacity-50"
                value={lstmLayers}
                onChange={(e) => setLstmLayers(parseInt(e.target.value))}
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
              </select>
            </div>

            {/* Dataset Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dataset</label>
              <select
                className="w-full border-gray-300 rounded-md shadow-sm border p-2 text-sm focus:border-[#3399cc] focus:ring focus:ring-[#3399cc] focus:ring-opacity-50"
                value={dataset}
                onChange={(e) => setDataset(e.target.value)}
              >
                <option value="google">Google</option>
                <option value="tesla">Tesla</option>
                <option value="Mumbai Weather">Mumbai Weather (Temp)</option>
              </select>
            </div>

            {/* Run Button */}
            <button
              onClick={handleRun}
              disabled={loading}
              className={`w-full py-4 rounded-md font-bold text-white transition-all shadow-md mt-4 ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#ff6600] hover:bg-[#e65c00]"
                }`}
            >
              {loading ? "TRAINING..." : "▶ RUN SIMULATION"}
            </button>
          </div>
        </div>

        {/* Results Panel */}
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <h3 className="text-xl font-bold mb-4 border-b pb-2 text-[#3399cc]">Results Panel</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-gray-50 p-3 rounded border">
              <span className="font-semibold text-gray-600">MSE:</span>
              <span className="font-mono text-lg text-green-600">{results ? results.mse : "0.000"}</span>
            </div>
            <div className="flex justify-between items-center bg-gray-50 p-3 rounded border">
              <span className="font-semibold text-gray-600">RMSE:</span>
              <span className="font-mono text-lg text-blue-600">{results ? results.rmse : "0.000"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Visualizer Area (Right) ─── */}
      <div className="w-full lg:w-2/3 space-y-6">
        {/* Sliding Window Preview */}
        <div className="bg-white border rounded-lg p-6 shadow-sm flex flex-col items-center justify-center min-h-[200px]">
          <h3 className="text-lg font-bold mb-4 text-[#3399cc] w-full text-left">Sliding Window Preview</h3>
          <div className="w-full bg-gray-50 border rounded p-6 flex flex-col items-center justify-center">
            <div className="flex flex-wrap gap-1.5 justify-center max-w-xl mx-auto mb-6">
              {Array.from({ length: 50 }).map((_, idx) => {
                const highlightedBlocks = Math.max(1, Math.ceil((windowSize / 200) * 50));
                const isHighlighted = idx >= 50 - highlightedBlocks;
                return (
                  <div
                    key={idx}
                    className={`w-4 h-4 sm:w-5 sm:h-5 rounded-sm transition-colors duration-300 shadow-sm ${isHighlighted ? "bg-[#8B0000]" : "bg-gray-200"
                      }`}
                  />
                )
              })}
            </div>
            <p className="text-sm text-gray-700 font-medium text-center bg-white px-4 py-2 rounded-full border shadow-sm">
              Currently using the past <span className="text-[#8B0000] font-bold">{windowSize}</span> days of data to predict day <span className="text-green-600 font-bold">{windowSize + 1}</span>.
            </p>
          </div>
        </div>

        {/* Charts Container */}
        <div className="bg-white border rounded-lg p-6 shadow-sm space-y-8">
          <h3 className="text-lg font-bold text-[#3399cc] border-b pb-2">Model Convergence (Loss Reduction)</h3>
          <div className="w-full min-h-[250px] flex items-center justify-center">
            {lossCurve.length > 0 ? (
              <Plot
                data={[{ x: Array.from({ length: lossCurve.length }, (_, i) => i + 1), y: lossCurve, type: "scatter", mode: "lines+markers", marker: { color: "#ff6600" } }]}
                layout={{ autosize: true, margin: { t: 10, r: 10, b: 40, l: 50 }, xaxis: { title: { text: "Epoch" } }, yaxis: { title: { text: "Loss" } }, font: { family: "Segoe UI, Roboto" } }}
                useResizeHandler style={{ width: "100%", height: "300px" }}
              />
            ) : (
              <span className="text-gray-400 font-medium">[Plotly/Chart.js Graph Placeholder]</span>
            )}
          </div>

          <h3 className="text-lg font-bold text-[#3399cc] border-b pb-2">
            {dataset === "Mumbai Weather" ? "Temperature Prediction (Actual vs. Predicted)" : "Stock Prediction (Actual vs. Predicted)"}
          </h3>
          <div className="w-full min-h-[250px] flex items-center justify-center">
            {actualPrices.length > 0 ? (
              <Plot
                data={[
                  { y: actualPrices, type: "scatter", mode: "lines", name: dataset === "Mumbai Weather" ? "Actual Temp" : "Actual Price", line: { color: "black", width: 2 } },
                  { y: predictedPrices, type: "scatter", mode: "lines", name: dataset === "Mumbai Weather" ? "Predicted Temp" : "Predicted Price", line: { color: "red", width: 2 } }
                ]}
                layout={{ autosize: true, margin: { t: 10, r: 10, b: 40, l: 50 }, xaxis: { title: { text: "Time Steps" } }, yaxis: { title: { text: dataset === "Mumbai Weather" ? "Temperature (°C)" : "Price" } }, font: { family: "Segoe UI, Roboto" }, showlegend: true }}
                useResizeHandler style={{ width: "100%", height: "300px" }}
              />
            ) : (
              <span className="text-gray-400 font-medium">[Plotly/Chart.js Graph Placeholder]</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
