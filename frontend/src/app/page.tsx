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
    { q: "What is overfitting in the context of deep learning?", a: ["When a model learns the training data and noise too well, failing to generalize", "When a model is too simple to capture patterns", "When training takes too long", "When the learning rate is too high"], c: 0 },
    { q: "Which of the following is a common sign of an overfitted model?", a: ["High training loss and high validation loss", "Low training loss and high validation loss", "High training accuracy and high validation accuracy", "Low training loss and low validation loss"], c: 1 },
    { q: "What is the shape of a single CIFAR-10 image input?", a: ["28x28x1", "32x32x3", "224x224x3", "64x64x1"], c: 1 },
    { q: "What does Dropout do during training to prevent overfitting?", a: ["Decreases the learning rate", "Randomly drops neurons and their connections", "Adds extra layers to the network", "Normalizes the input images"], c: 1 },
    { q: "How does Weight Decay (L2 Regularization) help reduce overfitting?", a: ["By dropping a percentage of connections randomly", "By adding noise to the input images", "By penalizing large weights to force a simpler, smoother model", "By removing entire convolutional layers"], c: 2 },
    { q: "What impact does increasing model capacity (more Conv layers/filters) have if there is limited training data?", a: ["Reduces the chance of overfitting", "Increases the chance of overfitting", "Decreases training time significantly", "Guarantees perfect test accuracy"], c: 1 },
    { q: "Why are CNNs particularly suited for CIFAR-10 compared to MLPs?", a: ["They process RGB patches and retain spatial structures unlike flattened inputs", "They use fewer activation functions", "They don&apos;t have hidden layers", "They don&apos;t calculate loss"], c: 0 },
    { q: "If your training accuracy is 99% but test accuracy is 60%, what is the most reasonable immediate step?", a: ["Increase model capacity", "Train for more epochs", "Increase Dropout and Weight Decay", "Increase learning rate to 1.0"], c: 2 },
    { q: "What is the primary function of Max Pooling layers in a CNN?", a: ["To reduce the spatial dimensions and computation, acting loosely as regularization", "To increase the number of channels", "To add non-linearity", "To compute gradients"], c: 0 },
    { q: "Is Dropout generally applied during evaluation/testing?", a: ["Yes, to maintain consistency", "No, all neurons are kept active with their outputs scaled appropriately", "Only on the convolutional layers", "Yes, but with double the rate"], c: 1 },
  ];

  const renderSectionContent = () => {
    switch (activeSection) {

      // ──── AIM ────
      case "aim":
        return (
          <div className="space-y-4">
            <p className="text-gray-700 leading-relaxed">
              The objective of this lab is to provide hands-on experience in understanding **overfitting** in 
              Convolutional Neural Networks (CNNs). Specifically, this experiment focuses on classifying images from the 
              CIFAR-10 dataset (32x32 color images across 10 classes) using a CNN model.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Students will learn to recognize the symptoms of overfitting—such as a growing gap between training and validation performance—and 
              explore regularisation tools like **Dropout** and **Weight Decay (L2 Regularization)** to build models that generalize well to unseen data.
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
              <li>Understand the concept of model generalization versus overfitting in Deep Learning.</li>
              <li>Describe the architecture of a Convolutional Neural Network built for the CIFAR-10 dataset.</li>
              <li>Identify the physical signs of overfitting on training vs. validation loss/accuracy curves.</li>
              <li>Configure CNN hyperparameters focusing on Dropout and Weight Decay (Alpha).</li>
              <li>Analyze the trade-off between model capacity (layers/filters) and the amount of regularization required.</li>
              <li>Interpret when a model has achieved a good fit versus when it has memorized the training set.</li>
            </ul>
          </div>
        );

      // ──── THEORY ────
      case "theory":
        return (
          <div className="space-y-8 text-gray-700">
            {/* Generalization vs Overfitting */}
            <div>
              <h4 className="text-lg font-semibold mb-3 text-[#3399cc]">1. Generalization vs. Overfitting</h4>
              <p className="leading-relaxed">
                In machine learning, the ultimate goal is to build models that perform well on new, unseen data. This ability is known as <strong>generalization</strong>.
                When a neural network has too much capacity (e.g., too many layers, filters, or neurons) compared to the amount of training data, it can learn to 
                simply <em>memorize</em> the training examples along with their noise and outliers.
              </p>
              <p className="leading-relaxed mt-2">
                This phenomenon is called <strong>overfitting</strong>. You can detect overfitting when the training loss continues to decrease to near zero, 
                but the test (or validation) loss starts to increase or stagnate.
              </p>
            </div>

            {/* CIFAR-10 Dataset */}
            <div>
              <h4 className="text-lg font-semibold mb-3 text-[#3399cc]">2. The CIFAR-10 Dataset</h4>
              <p className="leading-relaxed">
                The CIFAR-10 dataset consists of 60,000 color images in 10 classes, with 6,000 images per class. The classes include airplanes, automobiles, birds, cats, deer, dogs, frogs, horses, ships, and trucks.
              </p>
              <div className="bg-[#f2f7f9] p-4 rounded border-l-4 border-[#3399cc] mt-3">
                <p className="text-sm">
                  <strong>Total Set:</strong> 60,000 images<br/>
                  <strong>Image Size:</strong> 32 x 32 pixels x 3 channels (RGB)<br/>
                  <strong>Classes:</strong> 10 distinct categories<br/>
                  <strong>Complexity:</strong> Harder than MNIST; requires CNNs to extract structural hierarchy rather than relying on flat vector mappings.
                </p>
              </div>
            </div>

            {/* Overfitting Prevention techniques */}
            <div>
              <h4 className="text-lg font-semibold mb-3 text-[#3399cc]">3. Techniques to Mitigate Overfitting</h4>
              <p className="leading-relaxed">
                Regularization encompasses various techniques to constrain a neural network, making it harder for the network to memorize data and forcing it to learn robust patterns.
              </p>
              <div className="grid grid-cols-1 gap-3 mt-4">
                <div className="border p-3 rounded bg-gray-50">
                  <p className="font-semibold text-sm">Dropout</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Dropout randomly sets a fraction of input units or hidden neurons to 0 at each update during training time. 
                    This prevents neurons from co-adapting too much to specific noisy patterns. During evaluation, dropout is disabled and the network acts as an ensemble.
                  </p>
                </div>
                <div className="border p-3 rounded bg-gray-50">
                  <p className="font-semibold text-sm">Weight Decay (L2 Regularization)</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Adds a penalty proportional to the sum of the squared weights to the loss function. This pushes the optimizer to prefer smaller weights, yielding smoother, less complex decision boundaries.
                  </p>
                </div>
                <div className="border p-3 rounded bg-gray-50">
                  <p className="font-semibold text-sm">Model Capacity Adjustment</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Reducing the depth (number of convolutional layers) or width (number of filters) natively restricts the model&apos;s ability to memorize.
                  </p>
                </div>
              </div>
            </div>

            {/* Network Architecture */}
            <div>
              <h4 className="text-lg font-semibold mb-3 text-[#3399cc]">4. Convolutional Network Architecture</h4>
              <div className="bg-[#f2f7f9] p-4 rounded border-l-4 border-[#3399cc]">
                <p className="text-sm font-mono">
                  Input (32x32x3) &rarr; Conv Blocks + Pooling &rarr; Flatten &rarr; Fully Connected Layers (with Dropout) &rarr; Output (10 logits)
                </p>
              </div>
              <p className="leading-relaxed mt-3">
                Convolutional layers apply filters over spatial patches of the image, allowing the network to build hierarchical representations (edges to shapes to objects) 
                which is exceptionally powerful for the CIFAR-10 dataset.
              </p>
            </div>
          </div>
        );

      // ──── PROCEDURE ────
      case "procedure":
        return (
          <div className="space-y-6 text-gray-700">
            <p className="leading-relaxed">
              Follow these steps to observe overfitting and learn how to mitigate it:
            </p>
            <div className="space-y-4">
              {[
                { step: 1, title: "Navigate to Simulation", desc: "Click on 'Simulation' in the left sidebar to access the interactive environment." },
                { step: 2, title: "Establish a Baseline (Overfitting)", desc: "Set 'Model Capacity' to High. Set 'Dropout Rate' to 0.0 and 'Weight Decay' to 0.0. This configuring creates a highly complex model with zero regularization." },
                { step: 3, title: "Run and Observe", desc: "Run the simulation for 15-20 epochs. Watch the Accuracy Curve—you will notice training accuracy rapidly approaches 100%, but test accuracy stays much lower (e.g., 60-70%). This gap indicates severe overfitting." },
                { step: 4, title: "Introduce Dropout", desc: "Increase the 'Dropout Rate' to 0.4 or 0.5. Run the simulation again. You should see the training accuracy grow more slowly, but the gap between training and test accuracy will shrink, indicating better generalization." },
                { step: 5, title: "Apply Weight Decay", desc: "Keep Dropout moderate and increase 'Weight Decay (Alpha)' to a small positive value (e.g., 0.001 - 0.01). Run the simulation to see if the model generalizes even better by restricting weight sizes." },
                { step: 6, title: "Reduce Model Capacity", desc: "Change the 'Model Capacity' to Low. Notice how a simpler model struggles to reach 100% training accuracy, acting inherently as a regularizer, though it may underfit if it&apos;s too simple." },
                { step: 7, title: "Analyze The Matrix", desc: "Use the resulting Confusion Matrix and Prediction Sandbox to check which classes in CIFAR-10 (like cats and dogs, or automobiles and trucks) the model frequently confuses and whether regularization helps." },
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
        return null;

      // ──── OBSERVATION ────
      case "observation":
        return (
          <div className="space-y-8 text-gray-700">
            <p className="leading-relaxed">
              After running the CNN over the CIFAR-10 data under various regularisation schemes, common observations include:
            </p>

            {[
              {
                title: "Overtraining Without Regularization",
                content: "A CNN with high capacity and no dropout will often achieve nearly 100% training accuracy. However, its test accuracy usually plateaus or worsens after a certain number of epochs, proving that it is simply memorizing specific training pixels."
              },
              {
                title: "Effect of Dropout",
                content: "Adding Dropout (e.g., rate = 0.5) to fully connected layers prevents co-adaptation of neurons. Training accuracy drops initially because the network is hobbled during training, but test accuracy generally improves, yielding a much tighter fit between the two accuracy curves."
              },
              {
                title: "Effect of Weight Decay (L2)",
                content: "Applying weight decay restricts the model from relying aggressively on any single feature or pixel. While effective, setting weight decay too high forces weights to be excessively small, causing the model to underpredict and fail to learn entirely."
              },
              {
                title: "High vs Low Capacity",
                content: "A model with \"Low\" capacity contains fewer filters and convolutional layers. It rarely overfits on CIFAR-10 because it lacks the parameter space to memorize thousands of color images. It might, however, underfit, meaning both training and testing accuracy remain mediocre."
              },
              {
                title: "Confusion Between Classes",
                content: "Due to visual similarities at 32x32 resolution, even well-regularized models often misclassify \"cats\" vs \"dogs\" and \"automobiles\" vs \"trucks\". Regularization generally reduces these errors but cannot eliminate them completely given CIFAR-10&apos;s resolution constraints."
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
              Answer the following questions to verify your understanding of overfitting and regularisation.
            </p>
            {quizQuestions.map((q, i) => (
              <div key={i} className="border rounded-lg p-4 bg-white shadow-sm">
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
              The following resources provide additional reading on Convolutional Neural Networks, the CIFAR-10 dataset, and overfitting methodologies:
            </p>
            <div className="space-y-4">
              {[
                { title: "CIFAR-10 Dataset Details", url: "https://www.cs.toronto.edu/~kriz/cifar.html", desc: "The original homepage documenting the CIFAR-10 and CIFAR-100 datasets." },
                { title: "Dropout: A Simple Way to Prevent Neural Networks from Overfitting", url: "https://jmlr.org/papers/v15/srivastava14a.html", desc: "The landmark paper on Dropout by Nitish Srivastava, Geoffrey Hinton, et al." },
                { title: "CS231n: Convolutional Neural Networks for Visual Recognition", url: "https://cs231n.github.io/neural-networks-2/", desc: "Stanford course notes detailing strategies for regularization (L2, Dropout) and dealing with overfitting." },
                { title: "Deep Learning Book - Ian Goodfellow (Chapter 7: Regularization)", url: "https://www.deeplearningbook.org/contents/regularization.html", desc: "A robust mathematical explanation of weight decay, dataset augmentation, and dropout." },
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
                  ? "Simulation: CNN Overfitting on CIFAR-10"
                  : "Understanding Overfitting in CNNs"}
              </h2>
            </div>

            <div className="max-w-4xl mx-auto">
              <div style={{ display: activeSection === 'simulation' ? 'block' : 'none' }}>
                <Simulation />
              </div>
              <div style={{ display: activeSection !== 'simulation' ? 'block' : 'none' }}>
                {renderSectionContent()}
              </div>
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
