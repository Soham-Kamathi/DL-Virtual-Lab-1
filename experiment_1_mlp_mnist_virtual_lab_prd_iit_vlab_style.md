# Product Requirements Document (PRD)

## Deep Learning Virtual Lab – Experiment 1

### Handwritten Digit Classification using Multi-Layer Perceptron (MLP)

### VESIT Virtual Lab Style UI & Simulation

### Vivekanand Education Society’s Institute of Technology

### Department of Computer Engineering

---

## 1. Document Overview

**Product Name:** Deep Learning Virtual Lab\
**Experiment ID:** Experiment 1\
**Title:** Handwritten Digit Classification using Multi-Layer Perceptron (MLP)\
**Institution Style Reference:** Vivekanand Education Society’s Institute of Technology (VESIT) – Department of Computer Engineering **UI Inspiration Reference:** IIT / IIIT Virtual Labs adapted for VESIT academic branding\
**Primary Users:** Undergraduate engineering students, faculty, lab instructors\
**Platform:** Web application (responsive desktop-first)

### Purpose

This PRD defines the functional, technical, pedagogical, and UI requirements for building an interactive virtual lab for handwritten digit classification using an MLP model trained on the MNIST dataset.

The platform must replicate the **academic workflow of IIT VLab**:

- Aim
- Theory
- Procedure
- Simulation
- Observation
- Quiz
- Assignment
- References

while adding interactive ML experimentation.

---

## 2. Product Vision

Create a simulation-first educational platform where students can:

- understand MLP-based classification
- configure model parameters
- run experiments interactively
- visualize training behavior
- observe prediction outputs
- compare parameter choices
- answer observation-based questions

The lab should feel like:

**IIT VLab + ML Playground + academic experiment manual**

---

## 3. Learning Objectives

After completing the lab, students should be able to:

- understand image classification as pattern recognition
- understand MNIST data representation
- preprocess image data
- flatten 28×28 images into 784 dimensions
- configure an MLP architecture
- train and evaluate the model
- compare effect of hyperparameters
- interpret accuracy and loss graphs

---

## 4. User Personas

### Student

- performs experiment
- changes parameters
- observes results
- submits observations

### Faculty

- demonstrates concepts
- uses during practical session
- reviews student outputs

### Lab Instructor

- guides students
- validates understanding

---

## 5. Information Architecture (IIT VLab Style)

The experiment page must follow this exact structure.

```text
Experiment 1
├── Aim
├── Learning Outcomes
├── Theory
├── Dataset Description
├── Procedure
├── Simulation
├── Observation
├── Quiz
├── Assignment
├── References
```

---

## 6. UI Requirements

### Page Layout

Two-column layout.

```text
 ----------------------------------------------------------
| Left Navigation        | Main Experiment Workspace        |
|------------------------|----------------------------------|
| Aim                    | Experiment Title                 |
| Theory                 | Aim                              |
| Procedure              | Theory                           |
| Simulation             | Procedure                        |
| Observation            | Simulation                       |
| Quiz                   | Graphs                           |
| References             | Predictions                      |
 ----------------------------------------------------------
```

### UI Theme

Must follow VESIT branding and academic lab identity, inspired by IIT VLab layout patterns.

Requirements:

- clean academic design
- white background
- dark blue header
- structured cards
- section separators
- serif/academic heading style
- responsive desktop layout

---

## 7. Functional Modules

## Module A: Theory Section

Contains:

- aim
- dataset description
- learning explanation
- mathematical flow

Display formula block:

Input vector transformation:

784 → hidden layer → 10 outputs

This section should include:

- flattening explanation
- hidden layer explanation
- activation explanation
- softmax output explanation

---

## Module B: Procedure Section

Step-wise workflow:

1. import libraries
2. load dataset
3. preprocess data
4. configure model
5. compile model
6. train model
7. evaluate model
8. visualize predictions

Each step should have expandable accordion cards.

---

## Module C: Simulation Section (Core)

### Dataset Selection & Multi-Dataset Testing

The simulation must support testing the same MLP pipeline across multiple datasets so students can compare generalization and dataset-specific behavior.

#### Dataset Dropdown

Supported datasets in MVP:

- MNIST (default)
- Fashion-MNIST
- EMNIST Digits
- KMNIST
- Custom CSV image dataset (faculty upload)

UI control:

```text
 ------------------------------------------------
| Dataset               [ MNIST ▼ ]              |
| Train/Test Split      [ 80:20 ▼ ]              |
| Preview Samples       [ View ]                 |
 ------------------------------------------------
```

#### Learning Objective

This allows students to observe how the same architecture performs differently depending on the nature of the dataset.

Example comparison goals:

- handwritten digits vs clothing images
- simple vs noisy datasets
- balanced vs custom datasets

#### Dataset Preview Panel

Display:

- sample image grid
- image dimensions
- number of classes
- train/test size

---

This is the main interactive module.

### Parameter Control Panel

```text
 ------------------------------------------------
| Hidden Layers         [ 1 ]                    |
| Hidden Units          [ 128 ]                  |
| Activation            [ ReLU ▼ ]               |
| Optimizer             [ SGD ▼ ]                |
| Alpha (L2)            [ 0.2 ]                  |
| Batch Size            [ 32 ]                   |
| Epochs                [ 10 ]                   |
| Learning Rate         [ slider ]               |
|                                                |
|           [ Run Simulation ]                   |
 ------------------------------------------------
```

### Required Controls

#### Hidden Layers

- slider 1–5

#### Hidden Units

- slider 16–512

#### Activation Dropdown

Options:

- relu
- identity
- logistic
- tanh

#### Optimizer Dropdown

Options:

- sgd
- adam
- lbfgs

#### Alpha

regularization slider

#### Batch Size

Dropdown:

- 16
- 32
- 64
- 128

#### Epochs

1–50

---

## Module D: Visualization Dashboard

### 1. Training Loss Curve

Real-time line chart.

x-axis: epoch\
y-axis: loss

### 2. Accuracy Curve

x-axis: epoch\
y-axis: accuracy

### 3. Sample Prediction Panel

```text
 ------------------------------------
| input digit image                  |
| predicted label                    |
| actual label                       |
| confidence score                   |
 ------------------------------------
```

### 4. Confusion Matrix

10×10 matrix heatmap.

---

## Module E: Prediction Sandbox

Students can select random test samples.

```text
[ Previous ] [ Next ] [ Random Sample ]
```

Display:

- image
- predicted digit
- actual digit

---

## Module F: Observation Section

Students must answer guided observation questions.

Required prompts:

1. State the size of MNIST images.
2. Record test accuracy.
3. Increase hidden layers and compare.
4. Compare batch sizes.
5. Observe impact of identity activation.

Input should be text boxes.

---

## Module G: Quiz Section

MCQ based.

Example:

- Why do we normalize pixel values?
- Why flatten image to 784?
- What is effect of hidden layers?

---

## 8. Backend Requirements

## API Endpoints

### Run Experiment

`POST /api/mlp/run`

Payload:

```json
{
  "hidden_layers": [32,16],
  "activation": "identity",
  "solver": "sgd",
  "alpha": 0.2,
  "batch_size": 32,
  "epochs": 10
}
```

Response:

```json
{
  "accuracy": 0.94,
  "loss_curve": [],
  "accuracy_curve": [],
  "predictions": [],
  "confusion_matrix": []
}
```

---

## 9. Recommended Tech Stack

### Frontend (React-first Requirement)

- React.js (mandatory core frontend framework)
- Next.js (recommended for routing and deployment)
- TypeScript
- Tailwind CSS
- Plotly.js
- React Query / TanStack Query for API state
- React Router (if not using Next.js)

### Frontend Architecture Notes

The UI must remain fully React-based with reusable components for all future experiments.

Suggested component structure:

```text
components/
├── DatasetSelector
├── ParameterPanel
├── TrainingGraph
├── PredictionViewer
├── ConfusionMatrix
├── ObservationForm
```

This ensures the same components can be reused for future labs such as CNN, LSTM, and transfer learning.

### Backend

- FastAPI
- Python
- scikit-learn
- PyTorch (future upgrade)

### Model Engine

Use:

`sklearn.neural_network.MLPClassifier`

Initial default:

```python
MLPClassifier(
    hidden_layer_sizes=(128,),
    activation='relu',
    solver='adam',
    batch_size=32
)
```

---

## 10. Non Functional Requirements

- simulation response < 5 seconds
- mobile view readable
- desktop optimized
- graphs interactive
- reusable for other experiments

---

## 11. Success Metrics

- student completes experiment in < 20 min
- parameter understanding improves
-
  > 90% successful simulation runs
- positive faculty usability feedback

---

## 12. Future Enhancements

- export report PDF
- auto-generated observations
- faculty dashboard
- score-based assessment
- notebook integration

---

## 13. MVP Scope

Must include:

- theory
- procedure
- simulation
- graphs
- prediction panel
- observation questions

This is the minimum viable academic virtual lab.

