"use client";

import React, { useState } from "react";
// Integrating globally exported components
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import dynamic from "next/dynamic";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false }) as any;

const QuizSection = () => {
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [submitted, setSubmitted] = useState(false);

  const questions = [
    {
      id: 1,
      q: "What happens to the spatial dimensions of a 32x32 feature map after it passes through a 2x2 Max Pooling layer with a stride of 2?",
      options: ["A) It remains 32x32", "B) It becomes 64x64", "C) It becomes 16x16", "D) It is flattened to 1024"],
      answer: "C) It becomes 16x16"
    },
    {
      id: 2,
      q: "What is the primary function of the Dropout layer introduced in this simulation architecture?",
      options: [
        "A) To randomly disable neurons during training to prevent overfitting.",
        "B) To drop the learning rate when loss plateaus.",
        "C) To normalize the batches before convolution.",
        "D) To remove blurry images from the CIFAR-10 dataset."
      ],
      answer: "A) To randomly disable neurons during training to prevent overfitting."
    },
    {
      id: 3,
      q: "Why are Convolutional Neural Networks (CNNs) generally superior to standard MLPs for image classification?",
      options: [
        "A) CNNs train much faster on basic CPUs.",
        "B) CNNs process data in 1D arrays, saving memory.",
        "C) CNNs use mathematical filters that preserve 2D spatial relationships.",
        "D) CNNs do not require activation functions like ReLU."
      ],
      answer: "C) CNNs use mathematical filters that preserve 2D spatial relationships."
    },
    {
      id: 4,
      q: "If you see a very high number OUTSIDE the diagonal line of the generated Confusion Matrix (e.g., Row: Auto, Column: Truck), what does this indicate?",
      options: [
        "A) The model has achieved 100% accuracy for both classes.",
        "B) The model is frequently confusing one specific class for another due to shared visual features.",
        "C) The learning rate is set too low.",
        "D) The dataset is perfectly balanced."
      ],
      answer: "B) The model is frequently confusing one specific class for another due to shared visual features."
    },
    {
      id: 5,
      q: "During the first few epochs, some of the extracted Feature Maps might appear completely black. What is the most likely mathematical reason for this?",
      options: [
        "A) The image didn't load properly from the server.",
        "B) The Batch Normalization layer deleted the data.",
        "C) The filter output negative numbers, which the ReLU activation function turned into flat zeros.",
        "D) The Dropout layer dropped the entire image."
      ],
      answer: "C) The filter output negative numbers, which the ReLU activation function turned into flat zeros."
    }
  ];

  const handleSelect = (qId: number, option: string) => {
    if (!submitted) setAnswers({ ...answers, [qId]: option });
  };

  const score = questions.filter(q => answers[q.id] === q.answer).length;

  return (
    <div className="space-y-8 text-gray-700">
      <div className="bg-blue-50 border-l-4 border-[#3399cc] p-4 mb-6">
        <p className="font-semibold">Test your understanding of Convolutional Neural Networks.</p>
      </div>

      {questions.map((q, index) => (
        <div key={q.id} className="bg-white border rounded shadow-sm p-6">
          <h4 className="font-bold mb-4 text-gray-800">Q{index + 1}: {q.q}</h4>
          <div className="space-y-2">
            {q.options.map((opt, i) => {
              const isSelected = answers[q.id] === opt;
              const isCorrect = submitted && opt === q.answer;
              const isWrong = submitted && isSelected && opt !== q.answer;

              let btnClass = "w-full text-left p-3 rounded border transition-colors ";
              if (isCorrect) btnClass += "bg-green-100 border-green-500 font-semibold text-green-800";
              else if (isWrong) btnClass += "bg-red-100 border-red-500 text-red-800";
              else if (isSelected) btnClass += "bg-blue-100 border-blue-500";
              else btnClass += "bg-gray-50 hover:bg-gray-100 border-gray-200";

              return (
                <button key={i} onClick={() => handleSelect(q.id, opt)} disabled={submitted} className={btnClass}>
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="pt-4 border-t">
        {!submitted ? (
          <button onClick={() => setSubmitted(true)} disabled={Object.keys(answers).length < questions.length} className="bg-[#3399cc] text-white px-8 py-3 rounded font-bold hover:bg-[#2a7faa] disabled:opacity-50">
            Submit Answers
          </button>
        ) : (
          <div className="text-xl font-bold p-4 bg-gray-100 rounded text-center">
            You scored {score} out of {questions.length}!
            <button onClick={() => { setSubmitted(false); setAnswers({}); }} className="ml-4 text-sm text-[#3399cc] underline font-normal">Retake Quiz</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default function Experiment5Page() {
  const [activeSection, setActiveSection] = useState("aim");

  // Hyperparameters
  const [epochs, setEpochs] = useState<number>(10);
  const [batchSize, setBatchSize] = useState<number>(32);
  const [learningRate, setLearningRate] = useState<number>(0.001);
  const [dropoutRate, setDropoutRate] = useState<number>(0.25);

  // Simulation State Tracking
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [metrics, setMetrics] = useState<{ epoch: number; loss: number; accuracy: number }[]>([]);
  const [featureMaps, setFeatureMaps] = useState<string[]>([]);
  const [datasetPreview, setDatasetPreview] = useState<string[]>([]);
  const [confusionMatrix, setConfusionMatrix] = useState<number[][]>([]);

  const cifar10Classes = [
    "Airplane", "Auto", "Bird", "Cat", "Deer",
    "Dog", "Frog", "Horse", "Ship", "Truck"
  ];


  // 1. Fetch Dataset Preview
  const loadDatasetPreview = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/exp5/dataset/preview");
      const data = await res.json();
      setDatasetPreview(data.samples);
    } catch (e) {
      console.error("Failed to load dataset preview", e);
    }
  };

  // 2. Custom STREAM fetch for SSE under POST constraint
  const startTraining = async () => {
    setIsTraining(true);
    setMetrics([]); // Clear existing metrics

    try {
      const response = await fetch("http://localhost:8000/api/exp5/run-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ epochs, batch_size: batchSize, learning_rate: learningRate, dropout_rate: dropoutRate }),
      });

      if (!response.body) throw new Error("No response body exposed from API");

      // Grab streaming reader
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      // Continuous await to populate Table chunk-by-chunk implicitly 
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // Maintain partial JSON inside chunk frames

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.replace("data: ", "").trim();
            try {
              const parsed = JSON.parse(dataStr);
              setMetrics((prev) => [...prev, parsed]);
            } catch (err) {
              console.error("JSON parse error on SSE chunked stream", err);
            }
          }
        }
      }
    } catch (err) {
      console.error("Training stream failed:", err);
    } finally {
      setIsTraining(false);
    }
  };

  // 3. Extract Feature Maps Array
  const extractFeatures = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/exp5/extract-features", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const data = await res.json();

      // NEW: Intercept backend errors gracefully!
      if (!res.ok) {
        alert("Backend Error: " + (data.detail || "Something went wrong on the server."));
        return;
      }

      setFeatureMaps(data.layers || []);
    } catch (err) {
      console.error("Feature extraction failed", err);
    }
  };

  // 4. Load Scored Matrix Array
  const loadConfusionMatrix = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/exp5/confusion-matrix");

      const data = await res.json();

      // NEW: Intercept backend errors gracefully!
      if (!res.ok) {
        alert("Backend Error: " + (data.detail || "Something went wrong on the server."));
        return;
      }

      setConfusionMatrix(data.matrix || []);
    } catch (err) {
      console.error("CM Evaluation failed", err);
    }
  };

  const renderSectionContent = () => {
    switch (activeSection) {
      case "aim":
        return (
          <div className="space-y-4 text-gray-700 leading-relaxed text-lg">
            <p>
              To design, train, and evaluate a custom Convolutional Neural Network (CNN) for multi-class image classification using the CIFAR-10 dataset, and to interpret the model's spatial learning dynamics through real-time metrics, intermediate feature maps, and confusion matrices.
            </p>
          </div>
        );

      case "outcomes":
        return (
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <ul className="list-disc pl-6 space-y-3">
              <li><strong>Contrast</strong> the spatial architectural advantages of CNNs over standard Multi-Layer Perceptrons (MLPs) for 2D image data.</li>
              <li><strong>Analyze</strong> the effects of advanced hyperparameters—specifically Dropout and Batch Normalization—on model convergence and preventing overfitting.</li>
              <li><strong>Visualize and interpret</strong> intermediate feature extraction layers to understand how filters detect edges, textures, and shapes logically.</li>
              <li><strong>Evaluate</strong> model generalization dynamically using test-set confusion matrices to identify specific class-bias overlaps.</li>
            </ul>
          </div>
        );

      case "theory":
        return (
          <div className="space-y-8 text-gray-700">
            <div>
              <h4 className="text-xl font-semibold mb-3 text-[#3399cc]">1. The Convolutional Advantage</h4>
              <p className="leading-relaxed">
                Standard Neural Networks (MLPs) require 2D images to be flattened into 1D arrays, instantly destroying the geometric relationships between pixels. CNNs solve this by using sliding mathematical filters (kernels). This preserves the spatial structure and provides <strong>translation invariance</strong>—meaning if a cat is in the top-left of an image, the network will still recognize it even if it moves to the bottom-right.
              </p>
            </div>
            <div>
              <h4 className="text-xl font-semibold mb-3 text-[#3399cc]">2. Batch Normalization & Pooling</h4>
              <p className="leading-relaxed mb-4">
                <strong>Batch Normalization</strong> standardizes the inputs to deeper layers, preventing "internal covariate shift." This allows the network to use much higher learning rates and converge in a fraction of the time.
              </p>
              <p className="leading-relaxed">
                <strong>Max Pooling</strong> is heavily utilized to downsample the spatial dimensions of the feature maps (e.g., shrinking a 32x32 map to 16x16). This reduces computational load and forces the network to abstract the <em>presence</em> of a feature rather than its exact pixel location.
              </p>
            </div>
            <div>
              <h4 className="text-xl font-semibold mb-3 text-[#3399cc]">3. Dropout (Regularization)</h4>
              <p className="leading-relaxed">
                Dropout is an aggressive technique to prevent overfitting. By randomly setting a fraction of input units (e.g., 25%) to zero during training, it prevents the network from memorizing the specific training dataset. It forces the remaining neurons to learn robust, generalized features that will perform better on unseen test data.
              </p>
            </div>
          </div>
        );

      case "procedure":
        return (
          <div className="space-y-6 text-gray-700">
            <p className="leading-relaxed">Follow these steps to successfully execute the virtual simulation:</p>
            <div className="bg-gray-50 border p-6 rounded shadow-sm">
              <ul className="list-decimal pl-5 space-y-4 font-medium">
                <li>Navigate to the <strong>Simulation</strong> tab via the left sidebar.</li>
                <li>Click <strong>Preview Dataset</strong> to observe a random subset of the real-world CIFAR-10 repository (32x32 RGB images).</li>
                <li>Adjust the architecture hyperparameters. <em>(Recommended starting parameters: Epochs 20, Batch Size 32, Learning Rate 0.001, Dropout 0.25)</em>.</li>
                <li>Click <strong>Start Training</strong>. Monitor the Live Plotly dual-axis chart to ensure the green Accuracy line rises while the red Loss line decays.</li>
                <li>Once training completes, click <strong>Execute Feature Array Pipeline</strong>. Observe how the first Conv2D layer breaks down the image into distinct, mathematical texture maps.</li>
                <li>Finally, click <strong>Generate Labeled Confusion Matrix</strong>. Evaluate the off-diagonal cells to identify which object classes your specific model struggles to differentiate.</li>
              </ul>
            </div>
          </div>
        );

      case "simulation":
        return (
          <div className="space-y-8 p-4">
            {/* Upper Interactive Deck Control Panel */}
            <div className="bg-gray-50 border p-6 rounded shadow-sm">
              <h3 className="text-xl font-bold mb-4 text-[#3399cc]">Hyperparameter Controls (CIFAR-10)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold mb-1">Epochs: {epochs}</label>
                  <input type="range" min="1" max="25" value={epochs} onChange={(e) => setEpochs(Number(e.target.value))} className="w-full" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Batch Size</label>
                  <select value={batchSize} onChange={(e) => setBatchSize(Number(e.target.value))} className="w-full border p-2 rounded">
                    <option value={16}>16</option>
                    <option value={32}>32</option>
                    <option value={64}>64</option>
                    <option value={128}>128</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Learning Rate</label>
                  <select value={learningRate} onChange={(e) => setLearningRate(Number(e.target.value))} className="w-full border p-2 rounded">
                    <option value={0.01}>0.01</option>
                    <option value={0.001}>0.001</option>
                    <option value={0.0001}>0.0001</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Dropout: {dropoutRate}</label>
                  <input
                    type="range"
                    min="0"
                    max="0.6"
                    step="0.05"
                    value={dropoutRate}
                    onChange={(e) => setDropoutRate(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={startTraining}
                  disabled={isTraining}
                  className={`px-6 py-2 rounded text-white font-semibold transition-colors ${isTraining ? "bg-gray-400 cursor-not-allowed" : "bg-[#3399cc] hover:bg-[#2a7faa]"
                    }`}
                >
                  {isTraining ? "Training in progress..." : "Start Training"}
                </button>
                <button
                  onClick={loadDatasetPreview}
                  className="px-6 py-2 rounded border border-[#3399cc] text-[#3399cc] font-semibold hover:bg-blue-50"
                >
                  Preview Dataset
                </button>
              </div>
            </div>

            {/* CIFAR-10 Dataset Render Map */}
            {datasetPreview.length > 0 && (
              <div className="bg-gray-50 border p-6 rounded shadow-sm">
                <h3 className="font-bold mb-4 text-gray-800">CIFAR-10 Samples preview queue</h3>
                <div className="flex gap-4">
                  {datasetPreview.map((b64, idx) => (
                    <img key={idx} src={`data:image/png;base64,${b64}`} alt={`Sample array mapping ${idx}`} className="w-16 h-16 rounded shadow-sm" />
                  ))}
                </div>
              </div>
            )}

            {/* SSE Metrics Output BuildTable */}
            {metrics.length > 0 && (
              <div className="bg-gray-50 border p-6 rounded shadow-sm">
                <h3 className="font-bold mb-4 text-gray-800">Server-Sent Events: Real-time Live Metrics </h3>
                <div className="overflow-x-auto">
                  <div className="mb-8 w-full border rounded bg-white overflow-hidden shadow-inner">
                    <Plot
                      data={[
                        {
                          x: metrics.map((m) => m.epoch),
                          y: metrics.map((m) => m.accuracy),
                          type: "scatter",
                          mode: "lines+markers",
                          name: "Accuracy",
                          line: { color: "#16a34a", width: 3 }, // Green
                          yaxis: "y1",
                        },
                        {
                          x: metrics.map((m) => m.epoch),
                          y: metrics.map((m) => m.loss),
                          type: "scatter",
                          mode: "lines+markers",
                          name: "Loss",
                          line: { color: "#dc2626", width: 3, dash: "dot" }, // Red
                          yaxis: "y2",
                        },
                      ]}
                      layout={{
                        autosize: true,
                        margin: { l: 50, r: 50, t: 30, b: 40 },
                        paper_bgcolor: "transparent",
                        plot_bgcolor: "transparent",
                        xaxis: { title: "Epoch", gridcolor: "#e5e7eb" },
                        yaxis: {
                          title: "Accuracy",
                          tickformat: ",.0%",
                          range: [0, 1],
                          side: "left",
                          gridcolor: "#e5e7eb"
                        },
                        yaxis2: {
                          title: "Loss",
                          side: "right",
                          overlaying: "y",
                          showgrid: false,
                        },
                        legend: { orientation: "h", y: 1.1, x: 0.5, xanchor: "center" }
                      }}
                      useResizeHandler={true}
                      style={{ width: "100%", height: "350px" }}
                    />
                  </div>
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b-2">
                        <th className="py-2">Epoch Generation</th>
                        <th className="py-2">Categorical Crossentropy (Loss)</th>
                        <th className="py-2">Sparse Categorical Accuracy</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.map((m, idx) => (
                        <tr key={idx} className="border-b last:border-0 hover:bg-gray-100">
                          <td className="py-2">Epoch {m.epoch} / {epochs}</td>
                          <td className="py-2 text-red-500 font-medium">{m.loss.toFixed(4)}</td>
                          <td className="py-2 text-green-600 font-medium">{(m.accuracy * 100).toFixed(2)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Layer-to-feature Mapping Frame Viewer */}
            <div className="bg-gray-50 border p-6 rounded shadow-sm">
              <h3 className="text-xl font-bold mb-4 text-[#3399cc]">Extraction Matrix Layout (Conv2D Layer 1 Defaults)</h3>
              <button
                onClick={extractFeatures}
                className="bg-[#ff6600] text-white px-6 py-2 rounded hover:bg-[#e65c00] transition-colors mb-6"
              >
                Execute Feature Array Pipeline
              </button>

              {featureMaps?.length > 0 && (
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                  {featureMaps.map((b64, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                      <img src={`data:image/png;base64,${b64}`} className="w-full aspect-square border shadow-sm" alt={`Feature trace mask ${idx}`} />
                      <span className="text-xs text-gray-500 mt-1">Filter Block #{idx}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Predictions Cross-Matrix Layout Tabular grid */}
            <div className="bg-gray-50 border p-6 rounded shadow-sm">
              <h3 className="text-xl font-bold mb-4 text-[#3399cc]">Cross-evaluation Matrix Plot</h3>
              <button
                onClick={loadConfusionMatrix}
                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition-colors mb-6"
              >
                Generate Native Confusion Array
              </button>

              {confusionMatrix?.length > 0 && (
                <div className="overflow-x-auto">
                  <Plot
                    data={[
                      {
                        z: confusionMatrix,
                        x: cifar10Classes,
                        y: cifar10Classes,
                        type: "heatmap",
                        colorscale: "Blues", // Professional color gradient
                        showscale: true,
                        hoverongaps: false,
                        hovertemplate: "True: %{y}<br>Predicted: %{x}<br>Count: %{z}<extra></extra>"
                      },
                    ]}
                    layout={{
                      width: 600,
                      height: 500,
                      margin: { l: 80, r: 20, t: 20, b: 80 },
                      xaxis: {
                        title: "Predicted Label",
                        tickangle: -45, // Slant the labels to fit nicely
                        side: "bottom",
                      },
                      yaxis: {
                        title: "True (Actual) Label",
                        autorange: "reversed", // Flips Y-axis so 0 is at the top left like a standard matrix
                      },
                    }}
                    config={{ displayModeBar: false }}
                  />
                  <table className="text-center border-collapse">
                    <tbody>
                      {confusionMatrix.map((row, i) => (
                        <tr key={i}>
                          {row.map((val, j) => (
                            <td key={`${i}-${j}`} className={`w-8 h-8 border ${i === j ? "bg-green-200" : "bg-white"} text-xs p-1`}>
                              {val}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        );

      case "observation":
        return (
          <div className="space-y-6 text-gray-700">
            <div className="border-l-4 border-green-500 pl-4 py-2">
              <h4 className="font-bold text-lg text-gray-800">1. Diagnosing Underfitting via Matrix Stripes</h4>
              <p className="mt-2">If you train the model for only 5 epochs, the Confusion Matrix often shows solid vertical stripes (e.g., constantly guessing "Deer"). This is known as <strong>Mode Collapse</strong> due to underfitting. The model panics and guesses the same class to minimize loss. Training for 20+ epochs resolves this, forming a distinct diagonal line of True Positives.</p>
            </div>

            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <h4 className="font-bold text-lg text-gray-800">2. The "Dead ReLU" Phenomenon</h4>
              <p className="mt-2">When extracting intermediate feature maps, some filter blocks may appear completely black. This occurs because the filter output negative numbers, which the <strong>ReLU activation function</strong> squashes to zero. This visually proves that specific filters did not detect their targeted pattern (like a vertical edge) in that specific test image.</p>
            </div>

            <div className="border-l-4 border-purple-500 pl-4 py-2">
              <h4 className="font-bold text-lg text-gray-800">3. Class Overlap (Automobiles vs. Trucks)</h4>
              <p className="mt-2">By hovering over the off-diagonal cells in the Confusion Matrix, a distinct pattern of misclassification emerges. The network frequently confuses cats with dogs, and automobiles with trucks. This proves the CNN is learning logical geometric features (wheels, fur) rather than just memorizing background colors.</p>
            </div>
          </div>
        );

      case "quiz":
        return <QuizSection />;

      case "references":
        return (
          <div className="space-y-4 text-gray-700">
            <ul className="list-disc pl-6 space-y-3">
              <li>Krizhevsky, A. (2009). <em>Learning Multiple Layers of Features from Tiny Images</em>. Technical Report, University of Toronto. (CIFAR-10 Dataset).</li>
              <li>Goodfellow, I., Bengio, Y., & Courville, A. (2016). <em>Deep Learning</em>. MIT Press.</li>
              <li>Ioffe, S., & Szegedy, C. (2015). Batch Normalization: Accelerating Deep Network Training by Reducing Internal Covariate Shift. <em>ICML</em>.</li>
              <li>Srivastava, N., et al. (2014). Dropout: A Simple Way to Prevent Neural Networks from Overfitting. <em>Journal of Machine Learning Research</em>.</li>
            </ul>
          </div>
        );

      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h3 className="text-[#3399cc] text-xl font-medium mb-12">
          Computer Science and Engineering
        </h3>
        <div className="flex gap-12">
          <div className="w-64 flex-shrink-0 border-r border-gray-100">
            <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
          </div>
          <div className="flex-1">
            <div className="text-center mb-12">
              <h2 className="text-[#3399cc] text-3xl font-light">
                {activeSection === "simulation"
                  ? "Simulation Pipeline: Classification via Convolution Methods"
                  : "Deep Understanding of CNN Spatial Extractions"}
              </h2>
            </div>
            <div className="max-w-4xl mx-auto">
              {renderSectionContent()}
            </div>
          </div>
        </div>
      </main>
      <footer className="border-t mt-20 py-8 bg-gray-50 text-center text-xs text-gray-400">
        &copy; {new Date().getFullYear()} VESIT - Department of Computer Engineering. Virtual Labs. All rights reserved.
      </footer>
    </div>
  );
}
