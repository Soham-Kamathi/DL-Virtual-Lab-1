"use client";

import React from "react";
import dynamic from "next/dynamic";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

type Props = {
  title: string;
  x: number[];
  ySeries: Array<{ name: string; values: number[]; color: string }>;
  yAxisLabel: string;
};

export default function MetricsChart({ title, x, ySeries, yAxisLabel }: Props) {
  return (
    <div className="bg-white border p-5 rounded-lg">
      <h4 className="font-semibold text-gray-700 mb-3">{title}</h4>
      <Plot
        data={ySeries.map((series) => ({
          x,
          y: series.values,
          type: "scatter",
          mode: "lines+markers",
          name: series.name,
          marker: { color: series.color, size: 5 },
          line: {
            color: series.color,
            width: 2,
            shape: "spline",
            smoothing: 0.7,
          },
        }))}
        layout={{
          autosize: true,
          margin: { t: 10, r: 10, b: 40, l: 50 },
          xaxis: { title: "Epoch" },
          yaxis: { title: yAxisLabel },
          legend: { orientation: "h", y: -0.2 },
          font: { family: "Segoe UI, Roboto" },
        }}
        useResizeHandler
        style={{ width: "100%", height: "290px" }}
      />
    </div>
  );
}
