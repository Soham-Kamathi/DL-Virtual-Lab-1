"use client";

import React, { useMemo } from "react";
import dynamic from "next/dynamic";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

const MODEL_LABELS = {
  vanilla_autoencoder: "Vanilla",
  denoising_autoencoder: "Denoising",
  sparse_autoencoder: "Sparse",
  conv_autoencoder: "Convolutional",
};

const MODEL_FACTORS = {
  vanilla_autoencoder: { separation: 0.92, compactness: 1.1 },
  denoising_autoencoder: { separation: 1.08, compactness: 0.95 },
  sparse_autoencoder: { separation: 1.02, compactness: 0.9 },
  conv_autoencoder: { separation: 1.18, compactness: 0.82 },
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function pseudoRandom(seed) {
  const x = Math.sin(seed * 12.9898) * 43758.5453123;
  return x - Math.floor(x);
}

export default function LatentSpaceExplorer({ params, dataSource }) {
  const modelType = params?.model_type || "denoising_autoencoder";
  const noise = clamp(Number(params?.noise_factor ?? 0.3), 0, 1);
  const latentDim = clamp(Number(params?.latent_dim ?? 64), 16, 512);
  const factors =
    MODEL_FACTORS[modelType] || MODEL_FACTORS.denoising_autoencoder;

  const geometry = useMemo(() => {
    const latentStrength = (latentDim - 16) / (512 - 16);
    const separation = clamp(
      (1.0 + latentStrength * 2.6 - noise * 1.55) * factors.separation,
      0.45,
      4.4,
    );
    const compactness = clamp(
      (0.72 + noise * 1.15 - latentStrength * 0.62) * factors.compactness,
      0.25,
      1.75,
    );

    const classes = Array.from({ length: 10 }, (_, classId) => classId);
    const pointsPerClass = 20;

    const pointX = [];
    const pointY = [];
    const pointClass = [];
    const centroidX = [];
    const centroidY = [];

    classes.forEach((classId) => {
      const angle = (Math.PI * 2 * classId) / classes.length;
      const cx = Math.cos(angle) * separation;
      const cy = Math.sin(angle) * separation;

      centroidX.push(cx);
      centroidY.push(cy);

      for (let i = 0; i < pointsPerClass; i += 1) {
        const seed = classId * 1000 + i * 77 + latentDim * 13 + noise * 101;
        const jitterR = pseudoRandom(seed) * compactness;
        const jitterA = pseudoRandom(seed + 7.1) * Math.PI * 2;
        const localSkew =
          (pseudoRandom(seed + 13.7) - 0.5) * compactness * 0.35;

        pointX.push(cx + Math.cos(jitterA) * jitterR + localSkew);
        pointY.push(cy + Math.sin(jitterA) * jitterR - localSkew);
        pointClass.push(classId);
      }
    });

    const overlapRisk = clamp((compactness / separation) * 115, 6, 99);
    const geometryScore = clamp(100 - overlapRisk * 0.9, 5, 96);

    return {
      pointX,
      pointY,
      pointClass,
      centroidX,
      centroidY,
      separation,
      compactness,
      overlapRisk,
      geometryScore,
    };
  }, [factors.compactness, factors.separation, latentDim, noise]);

  return (
    <div className="bg-white border rounded-lg p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="font-semibold text-gray-800">Latent Space Explorer</h4>
        <span className="text-xs rounded px-2 py-1 border border-gray-200 bg-gray-50 text-gray-600">
          {MODEL_LABELS[modelType] || modelType} Representation
        </span>
      </div>

      <p className="text-xs text-gray-600">
        Live proxy of how embeddings shift as noise and bottleneck capacity
        change. Drag sliders to watch cluster spread and overlap update
        instantly.
      </p>

      <Plot
        data={[
          {
            x: geometry.pointX,
            y: geometry.pointY,
            text: geometry.pointClass.map((c) => `Class ${c}`),
            type: "scattergl",
            mode: "markers",
            hovertemplate: "%{text}<extra></extra>",
            marker: {
              color: geometry.pointClass,
              colorscale: "Turbo",
              cmin: 0,
              cmax: 9,
              size: clamp(8 + (latentDim - 16) / 24, 8, 14),
              opacity: 0.72,
              line: { width: 0 },
            },
            name: "Embeddings",
            showlegend: false,
          },
          {
            x: geometry.centroidX,
            y: geometry.centroidY,
            text: Array.from({ length: 10 }, (_, i) => `Centroid ${i}`),
            type: "scatter",
            mode: "markers+text",
            textposition: "top center",
            hovertemplate: "%{text}<extra></extra>",
            marker: {
              color: "#111827",
              size: 10,
              symbol: "diamond",
            },
            name: "Class Centers",
            showlegend: false,
          },
        ]}
        layout={{
          autosize: true,
          margin: { t: 10, r: 12, b: 36, l: 40 },
          xaxis: {
            title: "Latent Axis 1",
            zeroline: false,
            gridcolor: "#f1f5f9",
          },
          yaxis: {
            title: "Latent Axis 2",
            zeroline: false,
            gridcolor: "#f1f5f9",
            scaleanchor: "x",
            scaleratio: 1,
          },
          font: { family: "Segoe UI, Roboto" },
          paper_bgcolor: "#ffffff",
          plot_bgcolor: "#ffffff",
          transition: {
            duration: 260,
            easing: "cubic-in-out",
          },
        }}
        config={{ displayModeBar: false, responsive: true }}
        useResizeHandler
        style={{ width: "100%", height: "360px" }}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded border border-sky-100 bg-sky-50 p-3">
          <p className="text-[10px] uppercase tracking-widest text-sky-700">
            Separation
          </p>
          <p className="text-lg font-semibold text-sky-900">
            {geometry.separation.toFixed(2)}
          </p>
        </div>
        <div className="rounded border border-amber-100 bg-amber-50 p-3">
          <p className="text-[10px] uppercase tracking-widest text-amber-700">
            Compactness
          </p>
          <p className="text-lg font-semibold text-amber-900">
            {geometry.compactness.toFixed(2)}
          </p>
        </div>
        <div className="rounded border border-rose-100 bg-rose-50 p-3">
          <p className="text-[10px] uppercase tracking-widest text-rose-700">
            Overlap Risk
          </p>
          <p className="text-lg font-semibold text-rose-900">
            {geometry.overlapRisk.toFixed(0)}%
          </p>
        </div>
        <div
          className={`rounded border p-3 ${
            dataSource === "mock"
              ? "border-violet-100 bg-violet-50"
              : "border-emerald-100 bg-emerald-50"
          }`}
        >
          <p
            className={`text-[10px] uppercase tracking-widest ${
              dataSource === "mock" ? "text-violet-700" : "text-emerald-700"
            }`}
          >
            Geometry Index
          </p>
          <p
            className={`text-lg font-semibold ${
              dataSource === "mock" ? "text-violet-900" : "text-emerald-900"
            }`}
          >
            {geometry.geometryScore.toFixed(0)}/100
          </p>
        </div>
      </div>
    </div>
  );
}
