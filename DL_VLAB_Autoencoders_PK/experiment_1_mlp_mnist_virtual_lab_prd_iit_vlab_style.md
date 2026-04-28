# Product Requirements Document (PRD)

## Deep Learning Virtual Lab – Experiment 1

### Image Noise Reduction using Autoencoders

### VESIT Virtual Lab Style UI & Simulation

### Vivekanand Education Society’s Institute of Technology

### Department of Computer Engineering

---

## 1. Document Overview

**Product Name:** Deep Learning Virtual Lab\
**Experiment ID:** Experiment 1\
**Title:** Image Noise Reduction using Autoencoders\
**Institution Style Reference:** Vivekanand Education Society’s Institute of Technology (VESIT) – Department of Computer Engineering **UI Inspiration Reference:** IIT / IIIT Virtual Labs adapted for VESIT academic branding\
**Primary Users:** Undergraduate engineering students, faculty, lab instructors\
**Platform:** Web application (responsive desktop-first)

### Purpose

This PRD defines the functional, technical, pedagogical, and UI requirements for building an interactive virtual lab for image denoising and reconstruction using autoencoder models.

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

- understand encoder-decoder learning for representation compression
- configure denoising experiment parameters
- run experiments interactively
- visualize reconstruction behavior over epochs
- observe output quality differences between model variants
- compare parameter choices (noise factor, latent dimensions)
- answer observation-based questions

The lab should feel like:

**IIT VLab + ML Playground + academic experiment manual**

---

## 3. Learning Objectives

After completing the lab, students should be able to:

- understand image denoising as reconstruction learning
- understand latent representation and bottleneck design
- preprocess image data and add synthetic noise
- compare architecture choices across autoencoder variants
- run and analyze model behavior through reconstruction metrics
- compare effect of noise factor and latent dimensions
- interpret loss, PSNR, and SSIM trends

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

Encoder-decoder transformation:

$x_{noisy} \rightarrow Encoder \rightarrow z \rightarrow Decoder \rightarrow \hat{x}_{clean}$

This section should include:

- reconstruction objective explanation
- latent space/bottleneck explanation
- denoising objective explanation
- model variant differences (vanilla, denoising, sparse, convolutional)

---

## Module B: Procedure Section

Step-wise workflow:

1. import libraries
2. load dataset
3. normalize and inject noise
4. configure autoencoder variant
5. set latent dimensions/noise factor
6. run training or load preset artifacts
7. evaluate reconstruction quality
8. visualize input, noisy input, and output

Each step should have expandable accordion cards.

---

## Module C: Simulation Section (Core)

### Model Selection and Parameterized Experiments

The simulation must support testing multiple autoencoder variants with shared controls so students can compare reconstruction behavior and robustness.

#### Model Type Dropdown

Supported model types in MVP:

- vanilla_autoencoder
- denoising_autoencoder (default)
- sparse_autoencoder
- conv_autoencoder

UI control:

```text
 ------------------------------------------------
| Model Type            [ Denoising AE ▼ ]       |
| Noise Factor          [ 0.30 slider ]          |
| Latent Dim            [ 64 slider ]            |
 ------------------------------------------------
```

#### Learning Objective

This allows students to observe how reconstruction quality changes across architecture types and noise intensity.

Example comparison goals:

- vanilla vs denoising robustness
- sparse vs dense latent representations
- convolutional vs fully connected reconstruction fidelity

#### Sample Preview Panel

Display:

- clean input image
- noisy input image
- reconstructed output image
- side-by-side qualitative comparison

---

This is the main interactive module.

### Parameter Control Panel

```text
 ------------------------------------------------
| Model Type            [ Denoising AE ▼ ]       |
| Noise Factor          [ 0.30 ]                 |
| Latent Dimension      [ 64 ]                   |
|                                                |
|           [ Run Simulation ]                   |
 ------------------------------------------------
```

### Required Controls

#### Model Type

- dropdown with supported autoencoder variants

#### Noise Factor

- slider 0.0 to 1.0

#### Latent Dimension

- slider 2 to 512

---

## Module D: Visualization Dashboard

### 1. Training Loss Curve

Line chart.

x-axis: epoch\
y-axis: loss

### 2. Reconstruction Quality Curves

x-axis: epoch\
y-axis: PSNR and SSIM

### 3. Sample Reconstruction Panel

```text
 ------------------------------------
| clean input image                  |
| noisy input image                  |
| reconstructed image                |
| reconstruction quality indicators  |
 ------------------------------------
```

### 4. Comparative Model View

Optional side-by-side comparison across model types.

---

## Module E: Reconstruction Sandbox

Students can select random test samples.

```text
[ Previous ] [ Next ] [ Random Sample ]
```

Display:

- clean image
- noisy image
- reconstructed image

---

## Module F: Observation Section

Students must answer guided observation questions.

Required prompts:

1. State the input image size used in the experiment.
2. Record reconstruction loss trend.
3. Compare PSNR across two model variants.
4. Compare SSIM at two different noise factors.
5. Explain the effect of latent dimension on output quality.

Input should be text boxes.

---

## Module G: Quiz Section

MCQ based.

Example:

- Why do we normalize pixel values?
- Why is denoising autoencoder training done with noisy inputs and clean targets?
- How does latent bottleneck size affect reconstruction?

---

## 8. Backend Requirements

## API Endpoints

### Run Experiment

`POST /run-experiment`

Payload:

```json
{
  "model_type": "denoising_autoencoder",
  "noise_factor": 0.3,
  "latent_dim": 64
}
```

Response:

```json
{
  "status": "success",
  "metrics": {
    "epochs": [],
    "train_loss": [],
    "val_loss": [],
    "psnr": [],
    "ssim": []
  },
  "images": {
    "clean": "...",
    "noisy": "...",
    "reconstructed": "..."
  },
  "secondary_images": null,
  "selected_preset": {
    "noise_factor": 0.3,
    "latent_dim": 64
  }
}
```

Additional endpoints:

- `GET /models`
- `GET /metrics?model_type=denoising_autoencoder`
- `GET /sample-images?model_type=denoising_autoencoder`

---

## 9. Recommended Tech Stack

### Frontend (React-first Requirement)

- React.js (mandatory core frontend framework)
- Next.js (recommended for routing and deployment)
- TypeScript
- Tailwind CSS
- Plotly.js
- Axios or Fetch for API state

### Frontend Architecture Notes

The UI must remain fully React-based with reusable components for all future experiments.

Suggested component structure:

```text
components/
├── ExperimentControls
├── MetricsChart
├── ImageComparison
├── NoiseReductionSimulation
├── ObservationForm
```

This ensures the same components can be reused for future labs such as CNN, LSTM, and transfer learning.

### Backend

- FastAPI
- Python
- PyTorch
- torchvision
- scikit-image

### Model Engine

Use:

PyTorch autoencoder implementations:

`vanilla_autoencoder`, `denoising_autoencoder`, `sparse_autoencoder`, `conv_autoencoder`

Initial default:

```python
model_type = "denoising_autoencoder"
noise_factor = 0.3
latent_dim = 64
```

---

## 10. Non Functional Requirements

- experiment response in interactive range for preset artifacts
- mobile view readable
- desktop optimized
- graphs interactive
- reusable for other experiments

---

## 11. Success Metrics

- student completes experiment in < 20 min
- improvement in understanding of reconstruction metrics (PSNR/SSIM)
- > 90% successful simulation runs
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
- reconstruction comparison panel
- observation questions

This is the minimum viable academic virtual lab.
