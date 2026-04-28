import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

const SUPPORTED_MODELS = [
  "vanilla_autoencoder",
  "denoising_autoencoder",
  "sparse_autoencoder",
  "conv_autoencoder",
];

const MODEL_BASELINES = {
  vanilla_autoencoder: { psnr: 22.8, ssim: 0.79, loss: 0.071 },
  denoising_autoencoder: { psnr: 26.2, ssim: 0.87, loss: 0.049 },
  sparse_autoencoder: { psnr: 24.3, ssim: 0.84, loss: 0.059 },
  conv_autoencoder: { psnr: 27.1, ssim: 0.9, loss: 0.043 },
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function toSafeArray(values) {
  return Array.isArray(values) ? values : [];
}

function normalizeMetrics(data) {
  const epochs = toSafeArray(data?.epochs);
  const trainLoss = toSafeArray(data?.train_loss);
  const valLoss = toSafeArray(data?.val_loss);
  const psnr = toSafeArray(data?.psnr);
  const ssim = toSafeArray(data?.ssim);

  const n = Math.min(
    epochs.length,
    trainLoss.length,
    valLoss.length,
    psnr.length,
    ssim.length,
  );

  if (n === 0) {
    return null;
  }

  return {
    epochs: epochs.slice(0, n),
    train_loss: trainLoss.slice(0, n),
    val_loss: valLoss.slice(0, n),
    psnr: psnr.slice(0, n),
    ssim: ssim.slice(0, n),
  };
}

function encodeSvgData(svg) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function mockImageCard(title, subtitle, palette) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 280" width="280" height="280">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${palette.start}"/>
        <stop offset="100%" stop-color="${palette.end}"/>
      </linearGradient>
    </defs>
    <rect width="280" height="280" fill="url(#g)"/>
    <rect x="22" y="22" width="236" height="236" rx="14" fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.35)"/>
    <text x="140" y="126" text-anchor="middle" font-family="Segoe UI, Arial" font-size="18" font-weight="700" fill="#0f172a">${title}</text>
    <text x="140" y="152" text-anchor="middle" font-family="Segoe UI, Arial" font-size="12" fill="#0f172a">${subtitle}</text>
  </svg>`;
  return encodeSvgData(svg);
}

function buildMockImages(modelType, noiseFactor = 0.3) {
  const modelLabel = modelType.replaceAll("_", " ");
  return {
    original: mockImageCard("Original", modelLabel, {
      start: "#dbeafe",
      end: "#bfdbfe",
    }),
    noisy: mockImageCard(
      `Noisy n=${noiseFactor.toFixed(2)}`,
      "simulated preview",
      {
        start: "#fee2e2",
        end: "#fecaca",
      },
    ),
    denoised: mockImageCard("Denoised", "autoencoder output", {
      start: "#dcfce7",
      end: "#bbf7d0",
    }),
    _meta: {
      source: "mock",
      reason: "offline-images",
    },
  };
}

function buildMockMetrics(modelType, noiseFactor = 0.3, latentDim = 64) {
  const baseline =
    MODEL_BASELINES[modelType] || MODEL_BASELINES.denoising_autoencoder;
  const epochs = Array.from({ length: 20 }, (_, i) => i + 1);

  const noiseDelta = (noiseFactor - 0.3) / 0.2;
  const latentDelta = (latentDim - 64) / 64;

  const lossScale = 1 + 0.22 * noiseDelta - 0.12 * latentDelta;
  const psnrShift = -1.65 * noiseDelta + 0.95 * latentDelta;
  const ssimShift = -0.07 * noiseDelta + 0.045 * latentDelta;

  const trainLoss = epochs.map((epoch) => {
    const curve = baseline.loss * (1.7 * Math.exp(-epoch / 5.9) + 0.42);
    return Number((curve * lossScale).toFixed(4));
  });
  const valLoss = trainLoss.map((value, idx) => {
    const drift = 1 + (idx / epochs.length) * 0.07;
    return Number((value * drift).toFixed(4));
  });

  const psnr = epochs.map((epoch) => {
    const growth = baseline.psnr - 4.2 + Math.log2(epoch + 1) * 1.45;
    return Number((growth + psnrShift * (epoch / epochs.length)).toFixed(3));
  });

  const ssim = epochs.map((epoch) => {
    const growth = baseline.ssim - 0.15 + Math.log2(epoch + 1) * 0.03;
    return Number(
      clamp(growth + ssimShift * (epoch / epochs.length), 0.4, 0.995).toFixed(
        4,
      ),
    );
  });

  return {
    epochs,
    train_loss: trainLoss,
    val_loss: valLoss,
    psnr,
    ssim,
    _meta: {
      source: "mock",
      reason: "offline-metrics",
    },
  };
}

function buildMockRun(payload = {}) {
  const modelType =
    payload.model_type && SUPPORTED_MODELS.includes(payload.model_type)
      ? payload.model_type
      : "denoising_autoencoder";
  const noiseFactor = clamp(Number(payload.noise_factor ?? 0.3), 0, 1);
  const latentDim = clamp(Number(payload.latent_dim ?? 64), 2, 512);

  return {
    status: "success",
    metrics: buildMockMetrics(modelType, noiseFactor, latentDim),
    images: buildMockImages(modelType, noiseFactor),
    secondary_images: null,
    selected_preset: {
      id: "mock-preset",
      noise_factor: noiseFactor,
      latent_dim: latentDim,
      distance: 0,
      interpolated: false,
      blend_alpha: 0,
      secondary_preset: null,
    },
    requested_params: {
      model_type: modelType,
      noise_factor: noiseFactor,
      latent_dim: latentDim,
    },
    _meta: {
      source: "mock",
      reason: "offline-experiment",
    },
  };
}

export async function healthCheck() {
  const response = await axios.get(`${API_BASE}/`);
  return response.data;
}

export async function fetchModels() {
  try {
    const response = await axios.get(`${API_BASE}/models`);
    if (Array.isArray(response.data) && response.data.length > 0) {
      return response.data;
    }
    return SUPPORTED_MODELS;
  } catch {
    return SUPPORTED_MODELS;
  }
}

export async function fetchMetrics(modelType = "denoising_autoencoder") {
  try {
    const response = await axios.get(`${API_BASE}/metrics`, {
      params: { model_type: modelType },
    });
    const normalized = normalizeMetrics(response.data);
    if (normalized) {
      return {
        ...normalized,
        _meta: {
          source: "backend",
        },
      };
    }
    return buildMockMetrics(modelType);
  } catch {
    return buildMockMetrics(modelType);
  }
}

export async function fetchImages(modelType = "denoising_autoencoder") {
  try {
    const response = await axios.get(`${API_BASE}/sample-images`, {
      params: { model_type: modelType },
    });
    if (
      response.data?.original ||
      response.data?.denoised ||
      response.data?.noisy
    ) {
      return {
        ...response.data,
        _meta: {
          source: "backend",
        },
      };
    }
    return buildMockImages(modelType);
  } catch {
    return buildMockImages(modelType);
  }
}

export async function runExperiment(payload) {
  try {
    const response = await axios.post(`${API_BASE}/run-experiment`, payload);
    const normalized = normalizeMetrics(response.data?.metrics);

    if (!response.data || response.data.status !== "success" || !normalized) {
      return buildMockRun(payload);
    }

    return {
      ...response.data,
      metrics: normalized,
      _meta: {
        source: "backend",
      },
    };
  } catch {
    return buildMockRun(payload);
  }
}
