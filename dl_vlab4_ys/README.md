# 🧠 Virtual Overfitting Lab

![Virtual Overfitting Lab](https://img.shields.io/badge/Status-Active-success)
![Frontend](https://img.shields.io/badge/Frontend-Next.js%20%7C%20React-blue)
![Backend](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python-green)

An interactive, educational web application designed to visually demonstrate the concept of **Overfitting in Deep Learning** and how to combat it utilizing techniques like Dropout and Weight Decay. Built specifically for students to gain hands-on intuition about Convolutional Neural Networks (CNNs) training on the CIFAR-10 dataset without waiting hours for actual model training.

---

## ⚡ Features

- **Instant Interactive Simulations:** Uses a fast, mathematically rigorous backend simulation instead of sluggish PyTorch loops to return immediate, realistic training and validation curves.
- **Dynamic Charting:** Real-time plotting of Loss and Accuracy curves that visually detach (U-shape curve) when Overfitting occurs.
- **Hands-on Hyperparameter Tuning:** Adjust Model Capacity, Epochs, Learning Rate, Dropout Rate, and L2 Regularization (Weight Decay) to see their direct impact.
- **Dataset Sandbox & Confusion Matrix:** Explore the CIFAR-10 dataset predictions under your configured model.
- **Step-by-Step Educational Flow:** Complete structured lab guide spanning from Aim and Theory to Procedure and Interactive Demonstration.

---

## 🏗 Architecture

The project is split into two primary components seamlessly connected via Server-Sent Events (SSE):

- **Backend / Simulation (`/backend`)**: A FastAPI Python application serving as the brain of the simulation. It dynamically evaluates the user's hyperparameter configurations and constructs physically accurate polynomial curves detailing validation loss spikes (overfitting) and mitigation via dropout/decay math logic.
- **Frontend / UI (`/frontend`)**: A modern React & Next.js interface structured as an interactive digital lab. It manages complex user states, orchestrates the real-time drawing of graphs using charting libraries, and handles dynamic UI components.

---

## 📖 Deep Learning Concepts Explored

### 1. Model Capacity
Capacity refers to the neural network's ability to memorize complex patterns. A highly complex model on simple data will memorize the training set perfectly (100% Training Accuracy) but perform poorly on test images. The interface allows you to toggle this capacity to observe the onset of overfitting.

### 2. Dropout Rate
Dropout is a regularization technique where randomly selected neurons are ignored during training.
- By configuring the `Dropout` slider in the lab, students can watch the validation loss spike smooth out, as the model is forced to learn redundant representations rather than relying on a few memorized features.

### 3. Weight Decay (L2 Regularization)
Weight decay places a penalty on large weights in the neural network. 
- By increasing the `Alpha` slider in the lab, students can physically see the simulated network's generalization improve as the optimizer is forced to favor smaller, smoother model parameters that are less susceptible to extreme noise.

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:
- [Node.js & npm](https://nodejs.org/en/) (for the frontend application)
- [Python 3.x](https://www.python.org/) & pip (for the backend API)

### 1. Launching the Backend API

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install the necessary Python packages:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the FastAPI server:
   ```bash
   python app.py
   ```
   *The backend will boot up at `http://localhost:8000` via Uvicorn.*

### 2. Launching the Frontend Interface

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the Node modules:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```

### 3. Start Exploring
4. Open your web browser and navigate to **`http://localhost:3000`** to start experimenting with the lab!

---

## 💡 Educational Objective

The primary objective of this virtual lab is to allow students to learn about model generalization through **hands-on experimentation**. By actively turning dials and tuning configurations, users can visually witness the onset of overfitting and immediately apply regularization techniques to see how a model's performance on unseen data is stabilized.

---
*Created as an interactive educational tool for visualizing Neural Network behaviors.*
