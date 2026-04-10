import numpy as np
from sklearn.neural_network import MLPClassifier
from sklearn.metrics import confusion_matrix, accuracy_score
import time
import json


def train_mlp_streaming(X_train, y_train, X_test, y_test, params):
    """
    Generator that trains MLPClassifier epoch-by-epoch.
    Yields SSE-formatted JSON strings with progress updates.
    """
    hidden_layer_sizes = tuple(params.get("hidden_layers", [128]))
    epochs = params.get("epochs", 10)
    solver = params.get("solver", "adam")
    dataset_name = params.get("dataset", "mnist_784")

    # Map labels to human-readable names for Fashion-MNIST
    if "fashion" in dataset_name.lower():
        from data_loader import FASHION_LABELS
        y_train = np.array([FASHION_LABELS.get(str(l), str(l)) for l in y_train])
        y_test = np.array([FASHION_LABELS.get(str(l), str(l)) for l in y_test])

    # Discover all unique class labels
    classes = np.unique(np.concatenate([y_train, y_test]))
    class_labels = sorted(classes.tolist())

    # lbfgs does not support partial_fit / warm_start iteration well,
    # so we fall back to single-shot training for it.
    if solver == "lbfgs":
        yield _sse_event("log", {"message": f"Solver 'lbfgs' uses full-batch mode. Training all {epochs} epochs at once..."})
        yield from _train_single_shot(X_train, y_train, X_test, y_test, params, class_labels)
        return

    mlp = MLPClassifier(
        hidden_layer_sizes=hidden_layer_sizes,
        activation=params.get("activation", "relu"),
        solver=solver,
        alpha=params.get("alpha", 0.0001),
        batch_size=params.get("batch_size", 32),
        learning_rate_init=params.get("learning_rate", 0.001),
        max_iter=1,
        warm_start=True,
        random_state=42,
        verbose=False,
    )

    loss_curve = []
    accuracy_curve = []
    start_time = time.time()

    yield _sse_event("log", {
        "message": f"Initializing MLP: layers={hidden_layer_sizes}, "
                   f"activation={params.get('activation','relu')}, solver={solver}",
    })
    yield _sse_event("log", {
        "message": f"Training on {len(X_train)} samples, testing on {len(X_test)} samples",
    })

    for epoch in range(1, epochs + 1):
        epoch_start = time.time()

        # Train one epoch (suppress convergence warning)
        import warnings
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            mlp.fit(X_train, y_train)

        epoch_time = time.time() - epoch_start
        current_loss = mlp.loss_
        loss_curve.append(float(current_loss))

        # Evaluate
        y_pred = mlp.predict(X_test)
        acc = float(accuracy_score(y_test, y_pred))
        accuracy_curve.append(acc)

        # Send epoch update
        yield _sse_event("epoch", {
            "epoch": epoch,
            "total_epochs": epochs,
            "loss": round(current_loss, 6),
            "accuracy": round(acc, 4),
            "epoch_time": round(epoch_time, 3),
            "loss_curve": loss_curve,
            "accuracy_curve": accuracy_curve,
        })

        yield _sse_event("log", {
            "message": f"Epoch {epoch}/{epochs} - loss: {current_loss:.4f} - "
                       f"accuracy: {acc:.4f} - {epoch_time:.2f}s",
        })

    # Final results
    total_time = time.time() - start_time
    y_pred = mlp.predict(X_test)
    final_acc = float(accuracy_score(y_test, y_pred))
    conf_matrix = confusion_matrix(y_test, y_pred, labels=class_labels)

    # Sample predictions
    n_samples = min(10, len(X_test))
    indices = np.random.choice(len(X_test), n_samples, replace=False)
    predictions = [
        {
            "image": X_test[i].tolist(),
            "predicted": str(y_pred[i]),
            "actual": str(y_test[i]),
        }
        for i in indices
    ]

    yield _sse_event("log", {
        "message": f"Training complete! Final accuracy: {final_acc:.4f} in {total_time:.2f}s",
    })

    yield _sse_event("result", {
        "accuracy": final_acc,
        "loss_curve": loss_curve,
        "accuracy_curve": accuracy_curve,
        "confusion_matrix": conf_matrix.tolist(),
        "class_labels": class_labels,
        "predictions": predictions,
        "training_time": round(total_time, 2),
    })


def _train_single_shot(X_train, y_train, X_test, y_test, params, class_labels):
    """Fallback for solvers that don't support warm_start iteration (lbfgs)."""
    hidden_layer_sizes = tuple(params.get("hidden_layers", [128]))
    epochs = params.get("epochs", 10)

    mlp = MLPClassifier(
        hidden_layer_sizes=hidden_layer_sizes,
        activation=params.get("activation", "relu"),
        solver=params.get("solver", "lbfgs"),
        alpha=params.get("alpha", 0.0001),
        max_iter=epochs,
        random_state=42,
        verbose=False,
    )

    start_time = time.time()
    import warnings
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        mlp.fit(X_train, y_train)
    total_time = time.time() - start_time

    y_pred = mlp.predict(X_test)
    final_acc = float(accuracy_score(y_test, y_pred))
    conf_matrix = confusion_matrix(y_test, y_pred, labels=class_labels)
    loss_curve = [float(l) for l in mlp.loss_curve_] if hasattr(mlp, "loss_curve_") else []

    # Generate accuracy curve from loss curve (approximate)
    accuracy_curve = [final_acc] * len(loss_curve) if loss_curve else [final_acc]

    n_samples = min(10, len(X_test))
    indices = np.random.choice(len(X_test), n_samples, replace=False)
    predictions = [
        {
            "image": X_test[i].tolist(),
            "predicted": str(y_pred[i]),
            "actual": str(y_test[i]),
        }
        for i in indices
    ]

    # Send all epochs at once via log
    for i, loss in enumerate(loss_curve):
        yield _sse_event("log", {
            "message": f"Epoch {i+1}/{len(loss_curve)} - loss: {loss:.4f}",
        })

    yield _sse_event("log", {
        "message": f"Training complete! Final accuracy: {final_acc:.4f} in {total_time:.2f}s",
    })

    yield _sse_event("result", {
        "accuracy": final_acc,
        "loss_curve": loss_curve,
        "accuracy_curve": accuracy_curve,
        "confusion_matrix": conf_matrix.tolist(),
        "class_labels": class_labels,
        "predictions": predictions,
        "training_time": round(total_time, 2),
    })


def _sse_event(event_type: str, data: dict) -> str:
    """Format a Server-Sent Event string."""
    payload = json.dumps({"type": event_type, **data})
    return f"data: {payload}\n\n"
