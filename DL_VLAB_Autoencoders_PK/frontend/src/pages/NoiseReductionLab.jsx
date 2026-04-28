"use client";

import React, { useCallback, useEffect, useState } from "react";
import Controls from "@/components/autoencoder/Controls";
import Charts from "@/components/autoencoder/Charts";
import MetricsCards from "@/components/autoencoder/MetricsCards";
import ImageComparison from "@/components/autoencoder/ImageComparison";
import LatentSpaceExplorer from "@/components/autoencoder/LatentSpaceExplorer";
import {
  fetchModels,
  fetchMetrics,
  fetchImages,
  runExperiment,
} from "@/services/api";

const DEFAULT_PARAMS = {
  model_type: "denoising_autoencoder",
  noise_factor: 0.3,
  latent_dim: 64,
};

const SIMULATION_STEPS = [
  "Loading model...",
  "Applying noise...",
  "Running inference...",
  "Computing metrics...",
];

const MODEL_EXPLANATIONS = {
  vanilla_autoencoder: {
    title: "Vanilla Autoencoder",
    summary:
      "Learns plain reconstruction with a bottleneck but without explicit denoising objectives.",
    behavior:
      "Best for understanding encoder-decoder compression fundamentals; less robust at higher noise.",
  },
  denoising_autoencoder: {
    title: "Denoising Autoencoder",
    summary:
      "Learns to map noisy inputs back to clean targets and is the most noise-aware option.",
    behavior:
      "Noise factor and latent dimension interact strongly: higher noise usually reduces PSNR/SSIM.",
  },
  sparse_autoencoder: {
    title: "Sparse Autoencoder",
    summary:
      "Adds sparsity constraints so latent features stay compact and interpretable.",
    behavior:
      "Can preserve salient structure with fewer active latent units, but may smooth fine details.",
  },
  conv_autoencoder: {
    title: "Convolutional Autoencoder",
    summary:
      "Uses convolutional layers to better capture local spatial patterns in images.",
    behavior:
      "Typically stronger on image structure and edges, often yielding better perceptual quality.",
  },
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function NoiseReductionLab() {
  const [params, setParams] = useState(DEFAULT_PARAMS);
  const [models, setModels] = useState(["denoising_autoencoder"]);

  const [loading, setLoading] = useState(false);
  const [bootLoading, setBootLoading] = useState(true);
  const [simulationStage, setSimulationStage] = useState("");
  const [error, setError] = useState(null);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [runVersion, setRunVersion] = useState(0);
  const [dataSource, setDataSource] = useState("backend");

  const [metrics, setMetrics] = useState(null);
  const [images, setImages] = useState(null);
  const [secondaryImages, setSecondaryImages] = useState(null);

  const loadModelArtifacts = useCallback(async (modelType) => {
    const [metricsData, imagesData] = await Promise.all([
      fetchMetrics(modelType),
      fetchImages(modelType),
    ]);
    setMetrics(metricsData || null);
    setImages(imagesData || null);
    setDataSource(
      metricsData?._meta?.source === "mock" ||
        imagesData?._meta?.source === "mock"
        ? "mock"
        : "backend",
    );
    setSecondaryImages(null);
    setSelectedPreset(null);
    setRunVersion((prev) => prev + 1);
  }, []);

  const loadInitialData = useCallback(async () => {
    setBootLoading(true);
    setError(null);
    try {
      const modelData = await fetchModels();
      let selectedModel = DEFAULT_PARAMS.model_type;

      if (Array.isArray(modelData) && modelData.length > 0) {
        setModels(modelData);
        selectedModel = modelData[0];
        setParams((prev) => ({ ...prev, model_type: selectedModel }));
      }

      await loadModelArtifacts(selectedModel);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          err?.message ||
          "Failed to load initial experiment data.",
      );
    } finally {
      setBootLoading(false);
    }
  }, [loadModelArtifacts]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    if (bootLoading) {
      return;
    }

    const refreshForModel = async () => {
      try {
        setError(null);
        await loadModelArtifacts(params.model_type);
      } catch (err) {
        setError(
          err?.response?.data?.detail ||
            err?.message ||
            "Failed to load model artifacts.",
        );
      }
    };

    refreshForModel();
  }, [bootLoading, params.model_type, loadModelArtifacts]);

  async function handleRun() {
    setLoading(true);
    setError(null);
    setSimulationStage(SIMULATION_STEPS[0]);

    try {
      const requestPromise = runExperiment(params);

      await sleep(350);
      setSimulationStage(SIMULATION_STEPS[1]);
      await sleep(350);
      setSimulationStage(SIMULATION_STEPS[2]);
      await sleep(450);
      setSimulationStage(SIMULATION_STEPS[3]);
      await sleep(450);

      const response = await requestPromise;
      if (!response || response.status !== "success") {
        throw new Error(
          response?.detail || "Experiment did not complete successfully.",
        );
      }

      setMetrics(response.metrics || null);
      setImages(response.images || null);
      setSecondaryImages(response.secondary_images || null);
      setSelectedPreset(response.selected_preset || null);
      setDataSource(response?._meta?.source === "mock" ? "mock" : "backend");
      setRunVersion((prev) => prev + 1);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          err?.message ||
          "Failed to run experiment.",
      );
    } finally {
      setLoading(false);
      setSimulationStage("");
    }
  }

  const modelGuide =
    MODEL_EXPLANATIONS[params.model_type] ||
    MODEL_EXPLANATIONS.denoising_autoencoder;
  const isMockMode = dataSource === "mock";

  return (
    <div className="space-y-6">
      {isMockMode && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-sm">
          <h3 className="text-base font-medium text-amber-800">
            Smart Simulation Mode
          </h3>
          <p className="mt-1 text-sm text-amber-700">
            Backend data is temporarily unavailable or incomplete. The lab is
            using concept-faithful mock curves and image placeholders so
            learners can still explore model behavior.
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-sm">
          <h3 className="text-base font-medium text-red-800">Error</h3>
          <p className="mt-1 text-sm text-red-700">{error}</p>
        </div>
      )}

      {bootLoading && (
        <div className="lab-card flex items-center gap-3">
          <div className="w-5 h-5 rounded-full border-2 border-gray-300 border-t-[#3399cc] animate-spin" />
          <p className="text-sm text-gray-600">
            Loading denoising experiment assets...
          </p>
        </div>
      )}

      <div className="bg-white border rounded-lg p-6 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-lg font-semibold text-[#3399cc]">Model Focus</h4>
          <span
            className={`text-xs uppercase tracking-widest rounded px-2 py-1 border ${
              isMockMode
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-emerald-50 text-emerald-700 border-emerald-200"
            }`}
          >
            Data Source: {isMockMode ? "Mock" : "Backend"}
          </span>
        </div>
        <p className="text-sm font-semibold text-gray-800">
          {modelGuide.title}
        </p>
        <p className="text-sm text-gray-700 leading-relaxed">
          {modelGuide.summary}
        </p>
        <p className="text-sm text-gray-600 leading-relaxed">
          {modelGuide.behavior}
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-3">
          <Controls
            models={models}
            params={params}
            loading={loading}
            simulationStage={simulationStage}
            selectedPreset={selectedPreset}
            onChange={setParams}
            onRun={handleRun}
          />
        </div>

        <div className="xl:col-span-6 space-y-5">
          <Charts metrics={metrics} runVersion={runVersion} />
          <MetricsCards metrics={metrics} />
          <LatentSpaceExplorer params={params} dataSource={dataSource} />
        </div>

        <div className="xl:col-span-3">
          <ImageComparison
            modelType={params.model_type}
            images={images}
            secondaryImages={secondaryImages}
            selectedPreset={selectedPreset}
            noiseFactor={params.noise_factor}
            latentDim={params.latent_dim}
          />
        </div>
      </div>

      <div className="bg-white border rounded-lg p-6 space-y-4">
        <h4 className="text-lg font-semibold text-[#3399cc]">
          Theory and Explanation
        </h4>
        <p className="text-sm text-gray-700 leading-relaxed">
          Denoising autoencoders learn to reconstruct clean images from noisy
          inputs by passing images through an encoder-decoder bottleneck. The
          encoder compresses important structure and the decoder recovers the
          image.
        </p>
        <p className="text-sm text-gray-700 leading-relaxed">
          In medical imaging contexts such as MRI or CT, reducing noise can
          improve visibility of fine structures. Higher noise factors generally
          reduce reconstruction quality, while a larger latent space can improve
          representational capacity.
        </p>
      </div>
    </div>
  );
}
