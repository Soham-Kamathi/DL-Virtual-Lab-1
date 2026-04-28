import torch
import torch.nn as nn
import torch.optim as optim
import torchvision
import torchvision.transforms as transforms
import json
import time
import numpy as np
from sklearn.metrics import confusion_matrix
import asyncio

from model import CIFAR10_CNN

# Use a subset so the live simulation doesn't take forever
SUBSET_TRAIN_SIZE = 10000   # Increased from 1000 to 10000 (20% of training data)
SUBSET_TEST_SIZE = 2000     # Increased from 200 to 2000 (20% of test data)

# Cache the dataset in memory to avoid slow disk read during simulation run
_trainset = None
_testset = None

def get_datasets():
    global _trainset, _testset
    if _trainset is None:
        # Very basic transforms
        transform = transforms.Compose([
            transforms.ToTensor(),
        ])
        
        full_trainset = torchvision.datasets.CIFAR10(root='./data', train=True, download=True, transform=transform)
        full_testset = torchvision.datasets.CIFAR10(root='./data', train=False, download=True, transform=transform)
        
        # Subsetting
        _trainset = torch.utils.data.Subset(full_trainset, range(SUBSET_TRAIN_SIZE))
        _testset = torch.utils.data.Subset(full_testset, range(SUBSET_TEST_SIZE))
        
    return _trainset, _testset

# Define CIFAR-10 classes
CLASSES = ["airplane", "automobile", "bird", "cat", "deer", "dog", "frog", "horse", "ship", "truck"]

async def run_simulation(config):
    # Retrieve hyperparameters
    model_capacity = config.get("model_capacity", "Medium")
    dropout_rate = config.get("dropout", 0.0)
    solver = config.get("solver", "adam").lower()
    alpha = config.get("alpha", 0.0001)           # Weight Decay
    batch_size = config.get("batch_size", 32)
    epochs = config.get("epochs", 30)  # Increased from 15 to 30 for better convergence
    lr = config.get("learning_rate", 0.001)

    yield json.dumps({'type': 'log', 'message': f'Initializing {model_capacity} Capacity CNN on CIFAR-10 (Simulated)'})
    
    trainset, testset = get_datasets()
        
    yield json.dumps({'type': 'log', 'message': f'Starting simulated training for {epochs} epochs...'})

    # Base target values based on capacity
    if model_capacity == "Low":
        target_train_acc = 0.65
        target_val_acc = 0.60
        capacity_factor = 0.0
    elif model_capacity == "Medium":
        target_train_acc = 0.85
        target_val_acc = 0.70
        capacity_factor = 0.5
    else: # High
        target_train_acc = 0.98
        target_val_acc = 0.75
        capacity_factor = 1.0
        
    overfitting_factor = capacity_factor * (1.0 - dropout_rate) * (1.0 - min(alpha * 1000, 1.0))
    
    loss_curve = []
    acc_curve = []
    val_loss_curve = []
    val_acc_curve = []
    
    start_time = time.time()
    
    for epoch in range(1, epochs + 1):
        progress = epoch / epochs
        
        train_loss = 2.3 * np.exp(-5 * progress) + np.random.normal(0, 0.02)
        train_acc = 0.1 + (target_train_acc - 0.1) * (1 - np.exp(-5 * progress)) + np.random.normal(0, 0.01)
        
        val_loss = 2.3 * np.exp(-4 * progress) + overfitting_factor * 2.0 * (progress ** 2) + np.random.normal(0, 0.02)
        val_acc = 0.1 + (target_val_acc - 0.1) * (1 - np.exp(-4 * progress)) + np.random.normal(0, 0.01)
        
        train_acc = float(min(0.999, max(0.1, train_acc)))
        val_acc = float(min(0.999, max(0.1, val_acc)))
        train_loss = float(max(0.01, train_loss))
        val_loss = float(max(0.01, val_loss))
        
        loss_curve.append(train_loss)
        acc_curve.append(train_acc)
        val_loss_curve.append(val_loss)
        val_acc_curve.append(val_acc)
        
        epoch_str = f"Epoch {epoch}/{epochs} | Train Loss: {train_loss:.4f} | Train Acc: {train_acc*100:.1f}% | Val Loss: {val_loss:.4f} | Val Acc: {val_acc*100:.1f}%"
        
        yield json.dumps({'type': 'log', 'message': epoch_str})
        
        epoch_data = {
            'type': 'epoch',
            'epoch': epoch,
            'total_epochs': epochs,
            'loss': round(train_loss, 4),
            'val_loss': round(val_loss, 4),
            'accuracy': train_acc,
            'val_accuracy': val_acc,
            'loss_curve': loss_curve,
            'val_loss_curve': val_loss_curve,
            'accuracy_curve': acc_curve,
            'val_accuracy_curve': val_acc_curve
        }
        yield json.dumps(epoch_data)
        
        # Small sleep so frontend actually has time to render SSE
        await asyncio.sleep(0.01)

    training_time = 0.1 # simulated time
    yield json.dumps({'type': 'log', 'message': f'Training completed in {training_time:.1f}s (simulated)'})

    # Simulated Evaluation
    cm = np.zeros((10, 10), dtype=int)
    for i in range(10):
        correct = int(200 * (val_acc_curve[-1] + np.random.normal(0, 0.02)))
        correct = max(0, min(200, correct))
        cm[i, i] = correct
        remaining = 200 - correct
        
        if remaining > 0:
            probs = np.random.rand(9)
            probs[np.random.randint(0, 9)] *= 4.0  # Create a confusion hotspot
            probs /= probs.sum()
            errors = np.random.multinomial(remaining, probs)
            
            idx = 0
            for j in range(10):
                if i != j:
                    cm[i, j] = errors[idx]
                    idx += 1
                
    sandbox_samples = []
    
    # Use real test images but fake the model's predictions
    for i in range(10):
        img, label = testset[i]
        flat_img = img.numpy().flatten().tolist()
        
        is_correct = np.random.random() < val_acc_curve[-1]
        if is_correct:
            pred = label
        else:
            candidates = [x for x in range(10) if x != label]
            pred = np.random.choice(candidates)
            
        sandbox_samples.append({
            "image": flat_img,
            "actual": CLASSES[label],
            "predicted": CLASSES[pred]
        })
                    
    result_data = {
        'type': 'result',
        'confusion_matrix': cm.tolist(),
        'class_labels': CLASSES,
        'accuracy': val_acc_curve[-1],
        'training_time': training_time,
        'predictions': sandbox_samples
    }
    
    yield json.dumps(result_data)
