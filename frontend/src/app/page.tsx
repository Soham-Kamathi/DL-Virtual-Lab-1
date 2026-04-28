"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Simulation from "@/components/Simulation";

export default function LabPage() {
  const [activeSection, setActiveSection] = useState("aim");
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [showQuizResults, setShowQuizResults] = useState(false);

  const quizQuestions = [
    { q: "What is the size of a single flattened MNIST image vector?", a: ["28", "784", "256", "1024"], c: 1 },
    { q: "Why do we normalize pixel values to the range [0, 1]?", a: ["To reduce image size", "To speed up convergence and ensure numerical stability", "To change image colors", "To remove noise"], c: 1 },
    { q: "What does the hidden layer in an MLP do?", a: ["Stores the training data", "Displays the output", "Learns non-linear feature representations from input data", "Normalizes the input"], c: 2 },
    { q: "Which activation function outputs values strictly between 0 and 1?", a: ["ReLU", "Tanh", "Sigmoid (Logistic)", "Identity"], c: 2 },
    { q: "What happens when you increase the number of hidden neurons significantly?", a: ["Model always improves", "Model may overfit on training data", "Training becomes faster", "Accuracy always drops"], c: 1 },
    { q: "What is the purpose of the L2 regularization parameter (alpha)?", a: ["Increases learning rate", "Adds penalty on large weights to prevent overfitting", "Removes hidden layers", "Changes the activation function"], c: 1 },
    { q: "In the confusion matrix, what do the diagonal elements represent?", a: ["Misclassified samples", "Total number of samples", "Correctly classified samples for each class", "Training loss values"], c: 2 },
    { q: "Which optimizer is generally preferred for training deep networks due to adaptive learning rates?", a: ["SGD", "L-BFGS", "Adam", "None of the above"], c: 2 },
    { q: "What does a decreasing loss curve during training indicate?", a: ["The model is forgetting patterns", "The model is learning and improving its predictions", "The learning rate is too high", "The dataset is too small"], c: 1 },
    { q: "If the training accuracy is 99% but test accuracy is 70%, what is likely happening?", a: ["Underfitting", "Overfitting", "Perfect generalization", "Data corruption"], c: 1 },
  ];

  const renderSectionContent = () => {
    switch (activeSection) {

      // ──── AIM ────
      case "aim":
        return (
          <div className="space-y-4">
            <p className="text-gray-700 leading-relaxed">
              The objective of this lab is to provide hands-on experience in understanding the basics of
              Artificial Neural Network (ANN) models and the pattern recognition tasks they perform.
              Specifically, this experiment focuses on classifying images from the
              MNIST dataset (handwritten digits 0-9) and the Fashion-MNIST dataset (clothing items) using a Multi-Layer Perceptron (MLP).
            </p>
            <p className="text-gray-700 leading-relaxed">
              Students will learn to configure MLP hyperparameters, observe their impact on training
              behavior, and interpret evaluation metrics such as accuracy, loss curves, and confusion matrices.
            </p>
            <div className="mt-8 space-y-4">
              <h4 className="font-bold text-gray-800 underline">Important Notes:</h4>
              <p className="text-gray-600 text-sm">
                If some or all of the tabs are not visible, kindly try reloading or refreshing the page.
                The simulation requires the backend server to be running on port 8000.
              </p>
            </div>
          </div>
        );

      // ──── LEARNING OUTCOMES ────
      case "outcomes":
        return (
          <div className="space-y-4 text-gray-700">
            <p className="mb-4">After completing this experiment, students should be able to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Understand image classification as a pattern recognition problem.</li>
              <li>Explain the dataset structures (MNIST and Fashion-MNIST): 28x28 grayscale images flattened to 784-dimensional vectors.</li>
              <li>Describe the architecture of a Multi-Layer Perceptron including input, hidden, and output layers.</li>
              <li>Configure MLP hyperparameters: hidden units, activation functions, optimizers, learning rate, batch size, and epochs.</li>
              <li>Train an MLP model and observe the training loss curve decreasing over epochs.</li>
              <li>Evaluate model performance using test accuracy and confusion matrices.</li>
              <li>Compare the effect of different hyperparameter choices on model generalization.</li>
              <li>Interpret when a model is underfitting or overfitting based on training vs. testing metrics.</li>
            </ul>
          </div>
        );

      // ──── THEORY ────
      case "theory":
        return (
          <div className="space-y-8 text-gray-700">
            {/* MLP Overview */}
            <div>
              <h4 className="text-lg font-semibold mb-3 text-[#3399cc]">1. Multi-Layer Perceptron (MLP)</h4>
              <p className="leading-relaxed">
                A Multi-Layer Perceptron (MLP) is a class of feedforward artificial neural networks (ANN).
                It consists of at least three layers of nodes: an <strong>input layer</strong>, one or more
                <strong> hidden layers</strong>, and an <strong>output layer</strong>. Each node (neuron) in
                one layer is connected to every node in the next layer with a certain weight, making it a
                fully connected (dense) network.
              </p>
              <p className="leading-relaxed mt-2">
                Unlike single-layer perceptrons, MLPs can learn non-linear decision boundaries by using
                non-linear activation functions. This makes them suitable for complex classification tasks
                such as handwritten digit recognition or classifying articles of clothing.
              </p>
            </div>

            {/* MNIST Datasets */}
            <div>
              <h4 className="text-lg font-semibold mb-3 text-[#3399cc]">2. The MNIST Datasets</h4>
              <p className="leading-relaxed">
                The original MNIST (Modified National Institute of Standards and Technology) dataset contains 70,000 grayscale images of handwritten digits (0-9). Fashion-MNIST serves as a direct drop-in replacement, containing 70,000 grayscale images of 10 fashion categories, such as shirts, trousers, and sneakers.
              </p>
              <div className="bg-[#f2f7f9] p-4 rounded border-l-4 border-[#3399cc] mt-3">
                <p className="text-sm">
                  <strong>Training Set:</strong> 60,000 images<br/>
                  <strong>Test Set:</strong> 10,000 images<br/>
                  <strong>Image Size:</strong> 28 x 28 pixels = 784 dimensions (when flattened)<br/>
                  <strong>Classes:</strong> 10 (digits 0-9 or 10 clothing categories)<br/>
                  <strong>Pixel Values:</strong> 0 (black) to 255 (white), normalized to [0, 1]
                </p>
              </div>
            </div>

            {/* Data Preprocessing */}
            <div>
              <h4 className="text-lg font-semibold mb-3 text-[#3399cc]">3. Data Preprocessing</h4>
              <p className="leading-relaxed">
                Before feeding images into the MLP, they must be preprocessed:
              </p>
              <ul className="list-disc pl-5 space-y-1 mt-2 text-sm">
                <li><strong>Flattening:</strong> Each 28x28 image is reshaped into a 1D vector of 784 elements.</li>
                <li><strong>Normalization:</strong> Pixel values are divided by 255 to scale them to the range [0, 1]. This ensures faster convergence during gradient descent optimization.</li>
                <li><strong>Train/Test Split:</strong> The dataset is split into training and testing subsets to evaluate generalization performance.</li>
              </ul>
            </div>

            {/* Network Architecture */}
            <div>
              <h4 className="text-lg font-semibold mb-3 text-[#3399cc]">4. Network Architecture</h4>
              <div className="bg-[#f2f7f9] p-4 rounded border-l-4 border-[#3399cc]">
                <p className="text-sm font-mono">
                  Input Layer (784 neurons) &rarr; Hidden Layer(s) (configurable) &rarr; Output Layer (10 neurons)
                </p>
              </div>
              <p className="leading-relaxed mt-3">
                The <strong>input layer</strong> receives the 784-dimensional flattened image vector.
                The <strong>hidden layers</strong> learn intermediate feature representations.
                The <strong>output layer</strong> has 10 neurons (one per digit class), producing a probability
                distribution using the softmax function.
              </p>
            </div>

            {/* Activation Functions */}
            <div>
              <h4 className="text-lg font-semibold mb-3 text-[#3399cc]">5. Activation Functions</h4>
              <p className="leading-relaxed mb-3">
                Activation functions introduce non-linearity into the network, enabling it to learn complex patterns:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="border p-3 rounded bg-gray-50">
                  <p className="font-semibold text-sm">ReLU (Rectified Linear Unit)</p>
                  <p className="text-xs text-gray-600 mt-1">f(x) = max(0, x). Most commonly used. Fast to compute, avoids vanishing gradient problem.</p>
                </div>
                <div className="border p-3 rounded bg-gray-50">
                  <p className="font-semibold text-sm">Sigmoid (Logistic)</p>
                  <p className="text-xs text-gray-600 mt-1">f(x) = 1/(1+e^(-x)). Outputs in (0,1). Can suffer from vanishing gradients.</p>
                </div>
                <div className="border p-3 rounded bg-gray-50">
                  <p className="font-semibold text-sm">Tanh (Hyperbolic Tangent)</p>
                  <p className="text-xs text-gray-600 mt-1">f(x) = tanh(x). Outputs in (-1,1). Zero-centered, better than sigmoid for hidden layers.</p>
                </div>
                <div className="border p-3 rounded bg-gray-50">
                  <p className="font-semibold text-sm">Identity (Linear)</p>
                  <p className="text-xs text-gray-600 mt-1">f(x) = x. No non-linearity. Network becomes a linear model. Useful as baseline comparison.</p>
                </div>
              </div>
            </div>

            {/* Optimizers */}
            <div>
              <h4 className="text-lg font-semibold mb-3 text-[#3399cc]">6. Optimizers</h4>
              <ul className="space-y-2 text-sm">
                <li><strong>SGD (Stochastic Gradient Descent):</strong> Updates weights using random mini-batches. Simple but can be slow to converge.</li>
                <li><strong>Adam (Adaptive Moment Estimation):</strong> Combines momentum and adaptive learning rates. Generally the best default choice for neural networks.</li>
                <li><strong>L-BFGS:</strong> A quasi-Newton method that works well on small datasets. Does not use mini-batches.</li>
              </ul>
            </div>

            {/* Loss Function */}
            <div>
              <h4 className="text-lg font-semibold mb-3 text-[#3399cc]">7. Loss Function &amp; Evaluation</h4>
              <p className="leading-relaxed">
                The MLP uses <strong>Cross-Entropy Loss</strong> for multi-class classification. During training,
                the optimizer minimizes this loss by adjusting weights via backpropagation. The model is evaluated
                using <strong>classification accuracy</strong> on the held-out test set, and a <strong>confusion
                matrix</strong> provides a per-class breakdown of predictions.
              </p>
            </div>
          </div>
        );

      // ──── PROCEDURE ────
      case "procedure":
        return (
          <div className="space-y-6 text-gray-700">
            <p className="leading-relaxed">
              Follow these steps to run the image classification experiment:
            </p>
            <div className="space-y-4">
              {[
                { step: 1, title: "Navigate to the Simulation Tab", desc: "Click on 'Simulation' in the left sidebar to open the interactive simulation panel." },
                { step: 2, title: "Select a Dataset", desc: "Choose 'MNIST Digits' (handwritten digits) or 'Fashion MNIST' (clothing items) from the Dataset dropdown. The Dataset Preview section will show sample images from the selected dataset." },
                { step: 3, title: "Configure Hidden Units", desc: "Use the Hidden Units slider (16-512) to set the number of neurons in the hidden layer. Start with 128 for a balanced model. Fewer neurons create simpler models; more neurons can capture complex patterns but risk overfitting." },
                { step: 4, title: "Choose Activation Function", desc: "Select an activation function: ReLU (recommended default), Sigmoid, Tanh, or Identity. Observe how different activations affect training behavior and final accuracy." },
                { step: 5, title: "Select Optimizer", desc: "Choose SGD, Adam (recommended), or L-BFGS. Adam typically converges faster than SGD. L-BFGS works best for small datasets." },
                { step: 6, title: "Set Regularization (Alpha)", desc: "Adjust the L2 regularization parameter using the Alpha slider. Higher values penalize large weights and help prevent overfitting. Start with the default 0.0001." },
                { step: 7, title: "Set Batch Size and Epochs", desc: "Choose a batch size (16, 32, 64, or 128) and set the number of training epochs (1-50) using the slider. More epochs allow more training iterations." },
                { step: 8, title: "Set Learning Rate", desc: "Adjust the learning rate slider (0.0001 to 0.1). A higher rate learns faster but may overshoot; a lower rate is more stable but slower." },
                { step: 9, title: "Run the Simulation", desc: "Click the 'RUN SIMULATION' button. Watch the Training Console for real-time epoch-by-epoch logs showing loss and accuracy. The loss and accuracy curves will update live." },
                { step: 10, title: "Analyze Results", desc: "After training completes, examine: (a) the Training Loss curve to verify it decreases, (b) the Accuracy Curve to see improvement over epochs, (c) the Test Accuracy percentage, (d) the Confusion Matrix heatmap for per-class performance, and (e) the Prediction Sandbox showing sample predictions vs actual labels." },
                { step: 11, title: "Experiment with Different Parameters", desc: "Re-run the simulation with different hyperparameter combinations. Compare results to understand how each parameter affects model performance. Record your observations in the Observation section." },
              ].map(({ step, title, desc }) => (
                <div key={step} className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#3399cc] text-white flex items-center justify-center text-sm font-bold">
                    {step}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      // ──── SIMULATION ────
      case "simulation":
        return <Simulation />;

      // ──── OBSERVATION ────
      case "observation":
        return (
          <div className="space-y-8 text-gray-700">
            <p className="leading-relaxed">
              After running the simulation with various parameter configurations, the following general
              observations can be made about how each hyperparameter affects model training and performance:
            </p>

            {[
              {
                title: "Effect of Hidden Units",
                content: "Increasing the number of hidden neurons (e.g., from 32 to 256) generally improves accuracy as the model can learn more complex feature representations. However, too many neurons (e.g., 512) on a small dataset may lead to overfitting, where training accuracy is high but test accuracy drops. A good starting point for MNIST is 128-256 neurons."
              },
              {
                title: "Effect of Activation Functions",
                content: "ReLU provides the fastest convergence and best accuracy for most configurations. Sigmoid and Tanh can work but may suffer from vanishing gradients in deeper networks, resulting in slower training. Identity activation removes all non-linearity, reducing the MLP to a linear model with significantly lower accuracy (typically 85-90% on MNIST vs 95%+ with ReLU)."
              },
              {
                title: "Effect of Optimizer Choice",
                content: "Adam consistently produces the fastest convergence and highest accuracy due to its adaptive learning rate mechanism. SGD converges more slowly and is sensitive to the learning rate setting. L-BFGS can achieve good results but is computationally expensive on larger datasets."
              },
              {
                title: "Effect of Learning Rate",
                content: "Very low learning rates (0.0001) result in slow but stable convergence. Moderate learning rates (0.001-0.01) with Adam optimizer typically give the best results. Very high learning rates (>0.05) cause the loss to oscillate or diverge, preventing the model from learning effectively."
              },
              {
                title: "Effect of Batch Size",
                content: "Smaller batch sizes (16-32) introduce more noise in gradient updates, which can help escape local minima but make training less stable. Larger batch sizes (64-128) provide smoother gradient estimates and more stable training but may converge to sharper minima with potentially worse generalization."
              },
              {
                title: "Effect of Epochs",
                content: "Increasing epochs allows the model to see the training data more times, generally improving accuracy up to a point. Beyond the optimal number of epochs, the model may start overfitting. For MNIST with Adam optimizer, 15-25 epochs typically suffice. The loss curve should flatten, indicating convergence."
              },
              {
                title: "Effect of Regularization (Alpha)",
                content: "L2 regularization (alpha) penalizes large weights, reducing overfitting. Very small alpha (0.0001) has minimal effect. Moderate alpha (0.01-0.1) helps generalization on small datasets. Very large alpha (>0.5) over-regularizes, preventing the model from fitting even the training data, resulting in underfitting."
              },
              {
                title: "Confusion Matrix Insights",
                content: "The confusion matrix reveals which digit pairs are most commonly confused. Typically, digits like 4 and 9, or 3 and 8, have higher misclassification rates due to visual similarity. A well-trained model shows high values along the diagonal (correct predictions) and near-zero off-diagonal values."
              },
            ].map((obs, i) => (
              <div key={i} className="border-l-4 border-[#3399cc] pl-4">
                <h4 className="font-semibold text-[#3399cc] mb-2">{obs.title}</h4>
                <p className="text-sm leading-relaxed">{obs.content}</p>
              </div>
            ))}
          </div>
        );

      // ──── QUIZ ────
      case "quiz":
        return (
          <div className="space-y-6">
            <p className="text-gray-600 text-sm mb-4">
              Answer the following questions based on the theory, simulation, and your observations.
            </p>
            {quizQuestions.map((q, i) => (
              <div key={i} className="border rounded-lg p-4 bg-white">
                <p className="font-semibold mb-3 text-gray-800">{i + 1}. {q.q}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {q.a.map((opt, idx) => {
                    const isSelected = quizAnswers[i] === idx;
                    const isCorrect = idx === q.c;
                    let optStyle = "hover:bg-gray-50";
                    if (showQuizResults && isSelected) {
                      optStyle = isCorrect ? "bg-green-50 border-green-500" : "bg-red-50 border-red-400";
                    } else if (showQuizResults && isCorrect) {
                      optStyle = "bg-green-50 border-green-300";
                    }
                    return (
                      <label key={idx}
                        className={`flex items-center space-x-2 p-2 rounded cursor-pointer border transition-colors ${optStyle}`}>
                        <input type="radio" name={`q-${i}`}
                          checked={isSelected}
                          onChange={() => setQuizAnswers({ ...quizAnswers, [i]: idx })}
                          disabled={showQuizResults} />
                        <span className="text-sm">{opt}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
            <div className="flex gap-4">
              <button
                onClick={() => setShowQuizResults(true)}
                disabled={Object.keys(quizAnswers).length < quizQuestions.length}
                className={`px-6 py-3 rounded-md font-bold text-white transition-all ${
                  Object.keys(quizAnswers).length < quizQuestions.length
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-[#3399cc] hover:bg-[#2a7faa]"
                }`}>
                Submit Answers
              </button>
              {showQuizResults && (
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-[#3399cc]">
                    Score: {quizQuestions.filter((q, i) => quizAnswers[i] === q.c).length}/{quizQuestions.length}
                  </span>
                  <button onClick={() => { setQuizAnswers({}); setShowQuizResults(false); }}
                    className="text-sm text-[#ff6600] underline hover:text-[#e65c00]">
                    Retry
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      // ──── REFERENCES ────
      case "references":
        return (
          <div className="space-y-6 text-gray-700">
            <p className="leading-relaxed">
              The following resources provide additional reading on Multi-Layer Perceptrons,
              the MNIST dataset, and neural network fundamentals:
            </p>
            <div className="space-y-4">
              {[
                { title: "MNIST Database - Yann LeCun", url: "http://yann.lecun.com/exdb/mnist/", desc: "The original MNIST handwritten digit database homepage with dataset details and benchmark results." },
                { title: "Scikit-learn MLPClassifier Documentation", url: "https://scikit-learn.org/stable/modules/generated/sklearn.neural_network.MLPClassifier.html", desc: "Official documentation for the MLPClassifier used in this experiment, including parameter descriptions." },
                { title: "Deep Learning Book - Ian Goodfellow (Chapter 6: Deep Feedforward Networks)", url: "https://www.deeplearningbook.org/contents/mlp.html", desc: "Comprehensive theoretical explanation of feedforward networks, backpropagation, and activation functions." },
                { title: "Neural Networks and Deep Learning - Michael Nielsen", url: "http://neuralnetworksanddeeplearning.com/", desc: "Free online book with interactive visualizations explaining neural network concepts from basics." },
                { title: "3Blue1Brown - Neural Networks (YouTube)", url: "https://www.youtube.com/playlist?list=PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi", desc: "Excellent visual series explaining how neural networks learn, including backpropagation and gradient descent." },
                { title: "Stanford CS231n - Convolutional Neural Networks for Visual Recognition", url: "https://cs231n.github.io/", desc: "Lecture notes covering neural network training, activation functions, optimization, and regularization." },
                { title: "Understanding Confusion Matrix", url: "https://towardsdatascience.com/understanding-confusion-matrix-a9ad42dcfd62", desc: "Article explaining how to read and interpret confusion matrices for classification tasks." },
                { title: "Adam Optimizer - Original Paper (Kingma & Ba, 2014)", url: "https://arxiv.org/abs/1412.6980", desc: "The original research paper proposing the Adam optimization algorithm." },
              ].map((ref, i) => (
                <div key={i} className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                  <a href={ref.url} target="_blank" rel="noopener noreferrer"
                    className="text-[#3399cc] font-semibold hover:text-[#ff6600] transition-colors">
                    {i + 1}. {ref.title}
                  </a>
                  <p className="text-xs text-gray-500 mt-1 break-all">{ref.url}</p>
                  <p className="text-sm text-gray-600 mt-2">{ref.desc}</p>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="p-8 text-center text-gray-400">
            <p>Content for &quot;{activeSection}&quot; is coming soon.</p>
          </div>
        );
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
                  ? "Simulation: Image Classification (MNIST / Fashion)"
                  : "Image Classification using MLP"}
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
