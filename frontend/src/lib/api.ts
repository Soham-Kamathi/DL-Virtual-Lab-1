import axios from "axios";

const API_URL = "http://localhost:8000";

export const getPreview = async (name: string = "mnist_784", n: number = 16) => {
  const response = await axios.get(`${API_URL}/api/dataset/preview`, {
    params: { name, n },
  });
  return response.data;
};

/**
 * Streams training progress via SSE from the backend.
 * Calls onEvent for each SSE message (log, epoch, result).
 */
export const runSimulationStream = async (
  params: any,
  onEvent: (event: any) => void
): Promise<void> => {
  const response = await fetch(`${API_URL}/api/mlp/run-stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `HTTP ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // Parse SSE events (format: "data: {...}\n\n")
    const parts = buffer.split("\n\n");
    buffer = parts.pop() || "";

    for (const part of parts) {
      const line = part.trim();
      if (line.startsWith("data: ")) {
        try {
          const json = JSON.parse(line.slice(6));
          onEvent(json);
        } catch {
          // skip malformed JSON
        }
      }
    }
  }
};
