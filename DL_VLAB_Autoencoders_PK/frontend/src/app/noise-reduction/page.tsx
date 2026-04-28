"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import NoiseReductionSimulation from "@/components/NoiseReductionSimulation";

export default function NoiseReductionLabPage() {
  const [activeSection, setActiveSection] = useState("aim");
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [showQuizResults, setShowQuizResults] = useState(false);

  const quizQuestions = [
    { q: "What is the primary objective of a denoising autoencoder?", a: ["To compress images into smaller files", "To reconstruct a clean image from a corrupted (noisy) image", "To generate entirely new images from scratch", "To classify objects in an image"], c: 1 },
    { q: "Which of the following is commonly used as a metric to evaluate noise reduction quality?", a: ["Cross-Entropy Loss", "Peak Signal-to-Noise Ratio (PSNR)", "F1 Score", "Confusion Matrix"], c: 1 },
    { q: "Why is noise reduction critical in medical imaging?", a: ["It improves diagnosis accuracy by enhancing image clarity", "It makes the images look more colorful", "It increases the file size of the medical scan", "It reduces the scan time for the patient"], c: 0 },
    { q: "What does the 'bottleneck' (latent space) in an autoencoder do?", a: ["It adds more noise to the image", "It forces the network to learn a compressed representation of the essential features", "It increases the image resolution", "It acts as the output layer"], c: 1 },
  ];

  const renderSectionContent = () => {
    switch (activeSection) {
      
      // ──── AIM ────
      case "aim":
        return (
          <div className="space-y-4">
            <p className="text-gray-700 leading-relaxed">
              The objective of this lab is to explore how Deep Learning models, specifically <strong>Denoising Autoencoders</strong>, can be used to remove noise from images. Although the concept is demonstrated using the Fashion-MNIST dataset, the underlying principles are highly applicable to <strong>Medical Imaging Noise Reduction</strong>, where scans like X-rays, MRIs, and CT scans often suffer from artifacting and sensor noise.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Students will run simulations to evaluate the performance of autoencoders at different noise levels and examine key evaluation metrics such as <strong>PSNR (Peak Signal-to-Noise Ratio)</strong> and <strong>SSIM (Structural Similarity Index)</strong>.
            </p>
          </div>
        );

      // ──── LEARNING OUTCOMES ────
      case "outcomes":
        return (
          <div className="space-y-4 text-gray-700">
            <p className="mb-4">After completing this experiment, students should be able to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Understand the architecture and purpose of an Autoencoder network.</li>
              <li>Explain how artificial noise is added to data and why models are trained to recover the original signal.</li>
              <li>Analyze training and validation loss curves to determine model convergence and generalization.</li>
              <li>Interpret image quality metrics including PSNR and SSIM.</li>
              <li>Correlate hyperparameter changes (like latent dimensions and noise factors) to model performance.</li>
            </ul>
          </div>
        );

      // ──── THEORY ────
      case "theory":
        return (
          <div className="space-y-8 text-gray-700">
            <div>
              <h4 className="text-lg font-semibold mb-3 text-[#3399cc]">1. What is an Autoencoder?</h4>
              <p className="leading-relaxed">
                An Autoencoder is a type of artificial neural network used to learn efficient codings of unlabeled data (unsupervised learning). It consists of two main parts: an <strong>Encoder</strong> that compresses the input into a latent-space representation, and a <strong>Decoder</strong> that reconstructs the input from the latent space.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-3 text-[#3399cc]">2. Denoising Autoencoder (DAE)</h4>
              <p className="leading-relaxed">
                A Denoising Autoencoder is an extension of the basic autoencoder. Instead of passing the original image to both the input and the target output, a <strong>corrupted (noisy) version</strong> of the image is passed as the input, while the model is trained to reconstruct the <strong>original uncorrupted image</strong>. It learns to ignore the "noise" and focus only on the robust structural features.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-3 text-[#3399cc]">3. Why Medical Imaging Noise Reduction Matters</h4>
              <p className="leading-relaxed">
                Medical images like MRI and low-dose CT scans are often prone to speckle or Gaussian noise due to hardware limitations or efforts to minimize patient radiation exposure. Denoising Autoencoders serve as powerful post-processing filters that enhance fine anatomical details without blurring critical boundaries—which is essential for accurate clinical diagnosis.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-3 text-[#3399cc]">4. Evaluation Metrics</h4>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li><strong>PSNR (Peak Signal-to-Noise Ratio):</strong> Measures the ratio between the maximum possible power of a signal and the power of corrupting noise. A higher PSNR generally indicates higher quality reconstruction.</li>
                <li><strong>SSIM (Structural Similarity Index Measure):</strong> Evaluates the perceived quality of digital images by considering changes in structural information, luminance, and contrast. SSIM ranges from -1 to 1, with 1 indicating perfect similarity.</li>
              </ul>
            </div>
          </div>
        );

      // ──── PROCEDURE ────
      case "procedure":
        return (
          <div className="space-y-6 text-gray-700">
            <p className="leading-relaxed">
              Steps to run the experiment:
            </p>
            <div className="space-y-4">
              {[
                { step: 1, title: "Go to the Simulation Tab", desc: "Open the interactive lab panel." },
                { step: 2, title: "Configure the Model", desc: "Select the 'Denoising Autoencoder' architecture from the dropdown." },
                { step: 3, title: "Set Noise Factor", desc: "Adjust the noise slider. Higher noise means the input image is more heavily corrupted." },
                { step: 4, title: "Set Latent Dimension", desc: "Adjust the 'bottleneck' size. A larger dimension holds more capacity but may not force effective compression." },
                { step: 5, title: "Run Simulation", desc: "Click the trigger button. Wait for the server to process the training (or fetch cached inference metrics)." },
                { step: 6, title: "Analyze Outputs", desc: "Observe the Training / Validation loss curves. Check the numerical evaluations (PSNR, SSIM) and physically compare the Original, Noisy, and Denoised images side-by-side." },
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
        return <NoiseReductionSimulation />;

      // ──── OBSERVATION ────
      case "observation":
        return (
          <div className="space-y-6 text-gray-700">
            <p className="leading-relaxed">
              Based on the experiment data, we observe the following characteristics of denoising models:
            </p>
            <ul className="list-disc pl-5 space-y-3">
              <li><strong>Impact of Noise Factor:</strong> As the noise factor increases, the DAE struggles more to reconstruct structural details, resulting in a lower final PSNR and SSIM.</li>
              <li><strong>Role of Latent Dimensions:</strong> Too small a latent dimension causes blurry reconstructions (underfitting). Too large a dimension may cause the model to copy noise instead of filtering it (overfitting).</li>
              <li><strong>Loss Convergence:</strong> Ideal training shows both train and validation losses decreasing and stabilizing. An increasing validation loss implies overfitting on the training set noise.</li>
            </ul>
          </div>
        );

      // ──── QUIZ ────
      case "quiz":
        return (
           <div className="space-y-6">
            <p className="text-gray-600 text-sm mb-4">
              Test your knowledge regarding Autoencoders and Noise Reduction:
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
            <p className="leading-relaxed">Learn more about Autoencoders:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><a href="https://www.deeplearningbook.org/contents/autoencoders.html" target="_blank" rel="noopener noreferrer" className="text-[#3399cc] hover:underline">Deep Learning Book - Autoencoders</a></li>
              <li><a href="https://keras.io/examples/vision/autoencoder/" target="_blank" rel="noopener noreferrer" className="text-[#3399cc] hover:underline">Building Autoencoders in Keras</a></li>
              <li><a href="https://en.wikipedia.org/wiki/Peak_signal-to-noise_ratio" target="_blank" rel="noopener noreferrer" className="text-[#3399cc] hover:underline">Understanding PSNR</a></li>
            </ul>
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
          Medical Imaging & Healthcare Applications
        </h3>

        <div className="flex gap-12">
          <div className="w-64 flex-shrink-0 border-r border-gray-100">
            <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
          </div>

          <div className="flex-1">
            <div className="text-center mb-12">
              <h2 className="text-[#3399cc] text-3xl font-light">
                {activeSection === "simulation"
                  ? "Simulation: Image Noise Reduction"
                  : "Medical Imaging Noise Reduction"}
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
