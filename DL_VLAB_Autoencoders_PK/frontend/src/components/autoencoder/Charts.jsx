"use client";

import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

export default function Charts({ metrics, runVersion }) {
  const epochs = metrics?.epochs || [];
  const trainLoss = metrics?.train_loss || [];
  const valLoss = metrics?.val_loss || [];
  const psnr = metrics?.psnr || [];
  const ssim = metrics?.ssim || [];
  const [visiblePoints, setVisiblePoints] = useState(0);

  useEffect(() => {
    if (!epochs.length) {
      setVisiblePoints(0);
      return;
    }

    setVisiblePoints(1);
    let index = 1;

    const timer = setInterval(() => {
      index += 1;
      setVisiblePoints(index);
      if (index >= epochs.length) {
        clearInterval(timer);
      }
    }, 220);

    return () => clearInterval(timer);
  }, [runVersion, epochs.length]);

  const visibleEpochs = useMemo(
    () => epochs.slice(0, visiblePoints),
    [epochs, visiblePoints],
  );
  const visibleTrainLoss = useMemo(
    () => trainLoss.slice(0, visiblePoints),
    [trainLoss, visiblePoints],
  );
  const visibleValLoss = useMemo(
    () => valLoss.slice(0, visiblePoints),
    [valLoss, visiblePoints],
  );
  const visiblePsnr = useMemo(
    () => psnr.slice(0, visiblePoints),
    [psnr, visiblePoints],
  );
  const visibleSsim = useMemo(
    () => ssim.slice(0, visiblePoints),
    [ssim, visiblePoints],
  );

  return (
    <div className="space-y-5">
      <div className="bg-white border rounded-lg p-5">
        <h4 className="font-semibold text-gray-700 mb-3">
          Training and Validation Loss
        </h4>
        <Plot
          key={`loss-${runVersion}`}
          revision={runVersion}
          data={[
            {
              x: visibleEpochs,
              y: visibleTrainLoss,
              type: "scatter",
              mode: "lines+markers",
              name: "Train Loss",
              marker: { color: "#ff6600", size: 5 },
              line: {
                color: "#ff6600",
                width: 2,
                shape: "linear",
              },
            },
            {
              x: visibleEpochs,
              y: visibleValLoss,
              type: "scatter",
              mode: "lines+markers",
              name: "Validation Loss",
              marker: { color: "#3399cc", size: 5 },
              line: {
                color: "#3399cc",
                width: 2,
                shape: "linear",
              },
            },
          ]}
          layout={{
            datarevision: runVersion,
            autosize: true,
            margin: { t: 10, r: 10, b: 40, l: 50 },
            xaxis: { title: "Epoch" },
            yaxis: { title: "Loss", autorange: true },
            legend: { orientation: "h", y: -0.2 },
            font: { family: "Segoe UI, Roboto" },
          }}
          useResizeHandler
          style={{ width: "100%", height: "290px" }}
        />
      </div>

      <div className="bg-white border rounded-lg p-5">
        <h4 className="font-semibold text-gray-700 mb-3">PSNR vs Epochs</h4>
        <Plot
          key={`psnr-${runVersion}`}
          revision={runVersion}
          data={[
            {
              x: visibleEpochs,
              y: visiblePsnr,
              type: "scatter",
              mode: "lines+markers",
              name: "PSNR (dB)",
              marker: { color: "#0ea5e9", size: 5 },
              line: {
                color: "#0ea5e9",
                width: 2,
                shape: "linear",
              },
            },
          ]}
          layout={{
            datarevision: runVersion,
            autosize: true,
            margin: { t: 10, r: 10, b: 40, l: 50 },
            xaxis: { title: "Epoch" },
            yaxis: { title: "PSNR (dB)", autorange: true },
            font: { family: "Segoe UI, Roboto" },
          }}
          useResizeHandler
          style={{ width: "100%", height: "290px" }}
        />
      </div>

      <div className="bg-white border rounded-lg p-5">
        <h4 className="font-semibold text-gray-700 mb-3">SSIM vs Epochs</h4>
        <Plot
          key={`ssim-${runVersion}`}
          revision={runVersion}
          data={[
            {
              x: visibleEpochs,
              y: visibleSsim,
              type: "scatter",
              mode: "lines+markers",
              name: "SSIM",
              marker: { color: "#10b981", size: 5 },
              line: {
                color: "#10b981",
                width: 2,
                shape: "linear",
              },
            },
          ]}
          layout={{
            datarevision: runVersion,
            autosize: true,
            margin: { t: 10, r: 10, b: 40, l: 50 },
            xaxis: { title: "Epoch" },
            yaxis: { title: "SSIM", autorange: true },
            font: { family: "Segoe UI, Roboto" },
          }}
          useResizeHandler
          style={{ width: "100%", height: "290px" }}
        />
      </div>

      <p className="text-xs text-gray-500 px-1">
        Animated epoch reveal: {visibleEpochs.length}/{epochs.length || 0}
      </p>
    </div>
  );
}
