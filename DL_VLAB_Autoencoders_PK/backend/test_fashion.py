import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__))))
import data_loader
from model import train_mlp_streaming

params = {
    "hidden_layers": [16],
    "activation": "relu",
    "solver": "adam",
    "alpha": 0.0001,
    "batch_size": 128,
    "epochs": 1,
    "learning_rate": 0.001,
    "dataset": "Fashion-MNIST"
}

X_train, X_test, y_train, y_test = data_loader.get_dataset("Fashion-MNIST", train_size=500, test_size=100)
print(f"X_train={X_train.shape}, y_train={y_train.shape}")

print('--- Streaming epochs ---')
for event in train_mlp_streaming(X_train, y_train, X_test, y_test, params):
    print(event.strip())
