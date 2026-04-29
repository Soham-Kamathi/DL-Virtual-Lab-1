"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Sidebar from "@/components/Sidebar";
import Simulation from "@/components/Simulation";

export default function LabPage() {
  const [activeSection, setActiveSection] = useState("aim");
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [showQuizResults, setShowQuizResults] = useState(false);

  const quizQuestions = [
    { q: "Which component of the LSTM architecture is responsible for deciding what information is discarded from the cell state?", a: ["Input Gate", "Output Gate", "Forget Gate", "Dense Layer"], c: 2 },
    { q: "What is the primary purpose of the 'Sliding Window' technique in time-series forecasting?", a: ["To scale the data between 0 and 1.", "To convert a 1D sequence into a supervised learning format (X features and y targets).", "To prevent the model from overfitting.", "To adjust the learning rate dynamically."], c: 1 },
    { q: "Which major problem found in standard Recurrent Neural Networks (RNNs) does the LSTM architecture solve?", a: ["The Vanishing Gradient Problem", "The Exploding Data Problem", "The Classification Dilemma", "The Over-scaling Issue"], c: 0 },
    { q: "Why is Min-Max Scaling applied to the stock dataset before feeding it to the LSTM?", a: ["To delete outliers from the dataset.", "To compress large price values into a 0 to 1 range, aiding faster optimizer convergence.", "To increase the overall volume of the dataset.", "To scramble the sequence of the time-series."], c: 1 },
    { q: "What is the function of the 'Dropout' layer in the sequential model?", a: ["It randomly turns off a percentage of neurons during training to prevent overfitting.", "It stops the training process early if the loss doesn't improve.", "It drops the earliest data points from the sequence to save memory.", "It drops the learning rate when it approaches the global minimum."], c: 0 },
  ];

  const renderSectionContent = () => {
    switch (activeSection) {

      // ──── AIM ────
      case "aim":
        return (
          <div className="space-y-4">
            <p className="text-gray-700 leading-relaxed">
              In this experiment, we will learn how to implement a Long Short-Term Memory (LSTM) neural network to predict sequential time-series data. We will focus on two distinct data paradigms: highly volatile financial data (stock market prices) and cyclical meteorological data (historical temperatures). We will explore data normalization, the sliding window technique, and sequential prediction.
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
      case "learning-outcomes":
        return (
          <div className="space-y-4 text-gray-700">
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>LO5:</strong> Design and implement sequential models such as RNNs and LSTMs for time series and sequence prediction tasks.</li>
            </ul>
          </div>
        );

      // ──── THEORY ────
      case "theory":
        return (
          <div className="space-y-8 text-gray-700">
            {/* Limitation of RNNs */}
            <div>
              <h4 className="text-lg font-semibold mb-3 text-[#3399cc]">1. The Limitation of Standard RNNs</h4>
              <p className="leading-relaxed">
                Standard Recurrent Neural Networks (RNNs) are designed to handle sequential data by passing hidden states from one time step to the next. However, they suffer from the <strong>Vanishing Gradient Problem</strong>. During backpropagation through time (BPTT), gradients can shrink exponentially, causing the network to &quot;forget&quot; long-term dependencies.
              </p>
            </div>

            {/* LSTM Architecture */}
            <div>
              <h4 className="text-lg font-semibold mb-3 text-[#3399cc]">2. Long Short-Term Memory (LSTM) Architecture</h4>
              <p className="leading-relaxed">
                LSTMs solve the vanishing gradient problem by introducing a central <strong>Cell State</strong> (<InlineMath math="C_t" />) that acts like a conveyor belt, carrying information through the sequence. The flow of information is regulated by three distinct gates:
              </p>
              <ul className="list-disc pl-5 space-y-4 mt-4">
                <li>
                  <strong>Forget Gate (<InlineMath math="f_t" />):</strong> Decides what information to discard from the previous cell state. It outputs a number between 0 and 1 using a sigmoid activation function.
                  <div className="mt-2"><BlockMath math="f_t = \boldsymbol{\sigma}(W_f \cdot [h_{t-1}, x_t] + b_f)" /></div>
                </li>
                <li>
                  <strong>Input Gate (<InlineMath math="i_t" />):</strong> Decides which new information from the current time step will be stored in the cell state.
                  <div className="mt-2"><BlockMath math="i_t = \boldsymbol{\sigma}(W_i \cdot [h_{t-1}, x_t] + b_i)" /></div>
                </li>
                <li>
                  <strong>Output Gate (<InlineMath math="o_t" />):</strong> Determines what the next hidden state (<InlineMath math="h_t" />) should be, based on a filtered version of the updated cell state.
                  <div className="mt-2"><BlockMath math="o_t = \boldsymbol{\sigma}(W_o \cdot [h_{t-1}, x_t] + b_o)" /></div>
                </li>
              </ul>
            </div>

            {/* Sliding Window Technique */}
            <div>
              <h4 className="text-lg font-semibold mb-3 text-[#3399cc]">3. The Sliding Window Technique</h4>
              <p className="leading-relaxed">
                Machine learning models require a supervised format with features (<InlineMath math="X" />) and targets (<InlineMath math="y" />). The sliding window technique converts a 1D sequence (e.g., daily temperatures) into this format by grouping a fixed number of past time steps (the window size) to predict the next immediate time step. The window then slides forward by one step.
              </p>
            </div>
          </div>
        );

      // ──── PROCEDURE ────
      case "procedure":
        return (
          <div className="space-y-6 text-gray-700">
            <h4 className="font-semibold text-lg text-[#3399cc]">Steps for conducting the experiment</h4>
            <div className="space-y-4">
              {[
                { step: 1, title: "Read Theory", desc: "Read the theory regarding LSTM architecture and the sliding window concept." },
                { step: 2, title: "Navigate to Simulation", desc: "Navigate to the Simulation tab to view the interactive environment." },
                { step: 3, title: "Select Dataset", desc: "Select your dataset (e.g., volatile Google Stock or cyclical Mumbai Weather)." },
                { step: 4, title: "Adjust Sequence Length", desc: "Adjust the Sequence Length (Window Size) to define the model's historical memory." },
                { step: 5, title: "Select LSTM Layers", desc: "Select the number of LSTM Layers to define the model's complexity." },
                { step: 6, title: "Run Simulation", desc: "Click 'Run Simulation' to observe the training loss convergence and the resulting actual vs. predicted graphs." },
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
            {[
              {
                title: "Model Convergence (Loss Curve)",
                content: "Upon running the simulation, the Mean Squared Error (MSE) loss curve should demonstrate a sharp initial drop during the first few epochs, indicating rapid learning. A flat plateau in the later epochs confirms the model has reached an optimal state without diverging."
              },
              {
                title: "Prediction Accuracy & Data Types",
                content: "The predicted line (Red) should track the overall trend of the actual data line (Black). For cyclical data like Mumbai Weather, the LSTM will quickly learn the smooth seasonal curves. For chaotic data like Tesla stock, the predictions will exhibit a slight lag due to the moving average nature of the sliding window attempting to smooth out unpredictable market spikes."
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
                className={`px-6 py-3 rounded-md font-bold text-white transition-all ${Object.keys(quizAnswers).length < quizQuestions.length
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
              The following resources were consulted for this experiment. You are encouraged to explore these links for deeper technical insights.
            </p>
            <div className="space-y-4">
              {[
                { title: "PyTorch Documentation: LSTM", url: "https://pytorch.org/docs/stable/generated/torch.nn.LSTM.html", desc: "Official documentation on implementing Long Short-Term Memory networks in PyTorch." },
                { title: "Understanding LSTM Networks", url: "https://colah.github.io/posts/2015-08-Understanding-LSTMs/", desc: "A highly detailed visual and mathematical breakdown of LSTM cells by Christopher Olah." },
                { title: "Scikit-Learn: MinMaxScaler", url: "https://scikit-learn.org/stable/modules/generated/sklearn.preprocessing.MinMaxScaler.html", desc: "Documentation on preprocessing and normalizing feature ranges." },
              ].map((ref, i) => (
                <div key={i} className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                  <a href={ref.url} target="_blank" rel="noopener noreferrer"
                    className="text-[#3399cc] font-semibold hover:text-[#ff6600] transition-colors">
                    {i + 1}. {ref.title}
                  </a>
                  <p className="text-xs text-gray-500 mt-1 break-all">
                    <a href={ref.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-words">
                      {ref.url}
                    </a>
                  </p>
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
                  ? "Simulation: Time-Series Forecasting using LSTM"
                  : "Deep Learning: Time-Series Forecasting using LSTM"}
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
