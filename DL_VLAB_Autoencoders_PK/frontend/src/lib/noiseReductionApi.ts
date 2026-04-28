import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

export const getModels = async () => {
  const response = await axios.get(`${API_URL}/models`);
  return response.data;
};

export const getMetrics = async () => {
  const response = await axios.get(`${API_URL}/metrics`);
  return response.data;
};

export const getPreview = async (
  name: string = "Fashion-MNIST",
  n: number = 16,
) => {
  const response = await axios.get(`${API_URL}/api/dataset/preview`, {
    params: { name, n },
  });
  return response.data;
};

export const getSampleImages = async () => {
  const response = await axios.get(`${API_URL}/sample-images`);
  return response.data;
};

export const runExperiment = async (payload: {
  model_type: string;
  noise_factor?: number;
  latent_dim?: number;
}) => {
  const response = await axios.post(`${API_URL}/run-experiment`, payload);
  return response.data;
};
