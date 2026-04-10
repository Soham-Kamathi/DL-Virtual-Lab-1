import numpy as np
from sklearn.datasets import fetch_openml
from sklearn.model_selection import train_test_split
import os
import pickle
import traceback
import ssl
import gzip
import sys

# Force UTF-8 encoding for stdout/stderr to prevent cp1252 crashes from keras progress bars on Windows
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

# Fix for SSL certificate errors on some lab/corporate networks
try:
    ssl._create_default_https_context = ssl._create_unverified_context
except Exception:
    pass

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data")

# Fashion-MNIST class label map (numeric -> human-readable)
FASHION_LABELS = {
    "0": "T-shirt/Top", "1": "Trouser", "2": "Pullover", "3": "Dress",
    "4": "Coat", "5": "Sandal", "6": "Shirt", "7": "Sneaker",
    "8": "Bag", "9": "Ankle Boot",
}


def load_local_mnist(name="mnist_784"):
    """
    Load exact MNIST/Fashion-MNIST from raw .gz files in the data/ directory.
    """
    prefix = "fashion-" if "fashion" in name.lower() else ""
    files = {
        "train_img": f"{prefix}train-images-idx3-ubyte.gz",
        "train_lbl": f"{prefix}train-labels-idx1-ubyte.gz",
        "test_img":  f"{prefix}t10k-images-idx3-ubyte.gz",
        "test_lbl":  f"{prefix}t10k-labels-idx1-ubyte.gz",
    }
    paths = {k: os.path.join(DATA_DIR, v) for k, v in files.items()}
    if not all(os.path.exists(p) for p in paths.values()):
        return None

    try:
        print(f"Loading {name} from local .gz files ...")

        def read_images(path):
            with gzip.open(path, "rb") as f:
                buf = f.read()
            return np.frombuffer(buf, np.uint8, offset=16).reshape(-1, 784).astype(np.float32) / 255.0

        def read_labels(path):
            with gzip.open(path, "rb") as f:
                buf = f.read()
            return np.frombuffer(buf, np.uint8, offset=8).astype(str)

        return (
            read_images(paths["train_img"]),
            read_images(paths["test_img"]),
            read_labels(paths["train_lbl"]),
            read_labels(paths["test_lbl"]),
        )
    except Exception as exc:
        print(f"Local .gz load failed: {exc}")
        return None


def _try_keras_fashion_mnist():
    """Try loading Fashion-MNIST via tensorflow/keras as fallback."""
    try:
        import tensorflow as tf
        (X_train, y_train), (X_test, y_test) = tf.keras.datasets.fashion_mnist.load_data()
        X_train = X_train.reshape(-1, 784).astype(np.float32) / 255.0
        X_test = X_test.reshape(-1, 784).astype(np.float32) / 255.0
        y_train = y_train.astype(str)
        y_test = y_test.astype(str)
        print("Loaded Fashion-MNIST via keras.datasets")
        return X_train, X_test, y_train, y_test
    except ImportError:
        pass
    try:
        from keras.datasets import fashion_mnist as fm
        (X_train, y_train), (X_test, y_test) = fm.load_data()
        X_train = X_train.reshape(-1, 784).astype(np.float32) / 255.0
        X_test = X_test.reshape(-1, 784).astype(np.float32) / 255.0
        y_train = y_train.astype(str)
        y_test = y_test.astype(str)
        print("Loaded Fashion-MNIST via keras")
        return X_train, X_test, y_train, y_test
    except ImportError:
        return None


def get_dataset(name="mnist_784", train_size=5000, test_size=1000):
    """
    Return (X_train, X_test, y_train, y_test) as numpy arrays.
    Order: features-train, features-test, labels-train, labels-test.
    """
    os.makedirs(DATA_DIR, exist_ok=True)
    safe_name = name.replace("/", "_").replace("-", "_")
    cache_path = os.path.join(DATA_DIR, f"{safe_name}_subset.pkl")

    # ---------- 1. Pickle cache ----------
    if os.path.exists(cache_path):
        try:
            with open(cache_path, "rb") as fh:
                X_train, X_test, y_train, y_test = pickle.load(fh)
                X_train = np.asarray(X_train, dtype=np.float32)
                X_test  = np.asarray(X_test,  dtype=np.float32)
                y_train = np.asarray(y_train).astype(str)
                y_test  = np.asarray(y_test).astype(str)

                assert X_train.shape[0] == y_train.shape[0], "train size mismatch"
                assert X_test.shape[0]  == y_test.shape[0],  "test size mismatch"
                assert X_train.shape[0] > 0, "empty training set"

                print(f"Cache OK - {name} train={X_train.shape[0]} test={X_test.shape[0]}")
                return X_train, X_test, y_train, y_test
        except Exception as exc:
            print(f"Cache invalid ({exc}). Deleting ...")
            try:
                os.remove(cache_path)
            except OSError:
                pass

    # ---------- 2. Local .gz files ----------
    local = load_local_mnist(name)
    if local is not None:
        X_train, X_test, y_train, y_test = local
        X_train, y_train = X_train[:train_size], y_train[:train_size]
        X_test,  y_test  = X_test[:test_size],   y_test[:test_size]
        _save_cache(cache_path, X_train, X_test, y_train, y_test)
        return X_train, X_test, y_train, y_test

    # ---------- 3. Keras fallback (Fashion-MNIST only) ----------
    if "fashion" in name.lower():
        keras_data = _try_keras_fashion_mnist()
        if keras_data is not None:
            X_train, X_test, y_train, y_test = keras_data
            X_train, y_train = X_train[:train_size], y_train[:train_size]
            X_test,  y_test  = X_test[:test_size],   y_test[:test_size]
            _save_cache(cache_path, X_train, X_test, y_train, y_test)
            return X_train, X_test, y_train, y_test

    # ---------- 4. fetch_openml ----------
    print(f"Downloading '{name}' from OpenML ...")
    try:
        X, y = fetch_openml(
            name, version=1, return_X_y=True,
            as_frame=False, parser="auto", data_home=DATA_DIR,
        )
        X = np.asarray(X, dtype=np.float32) / 255.0
        y = np.asarray(y).astype(str)

        total = train_size + test_size
        if len(X) > total:
            idx = np.random.RandomState(42).choice(len(X), total, replace=False)
            X, y = X[idx], y[idx]

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=42,
        )
        _save_cache(cache_path, X_train, X_test, y_train, y_test)
        return X_train, X_test, y_train, y_test

    except Exception as exc:
        traceback.print_exc()
        raise RuntimeError(
            f"Could not load dataset '{name}'. "
            f"Network error: {exc}. "
            f"Place raw .gz files in '{DATA_DIR}' for offline use."
        )


def _save_cache(path, X_train, X_test, y_train, y_test):
    """Persist the four arrays as a single pickle."""
    with open(path, "wb") as fh:
        pickle.dump(
            (np.asarray(X_train), np.asarray(X_test),
             np.asarray(y_train), np.asarray(y_test)),
            fh,
        )
    print(f"Saved cache -> {path}  train={len(X_train)} test={len(X_test)}")


def get_dataset_info(name="mnist_784"):
    """Return metadata about the dataset for the frontend."""
    is_fashion = "fashion" in name.lower()
    if is_fashion:
        return {
            "name": "Fashion-MNIST",
            "description": "Grayscale images of 10 clothing categories",
            "classes": 10,
            "image_size": "28x28",
            "label_map": FASHION_LABELS,
        }
    else:
        return {
            "name": "MNIST Digits",
            "description": "Grayscale images of handwritten digits 0-9",
            "classes": 10,
            "image_size": "28x28",
            "label_map": {str(i): str(i) for i in range(10)},
        }


def get_preview_samples(name="mnist_784", n_samples=16):
    """Return a list of {'image': [...], 'label': str} dicts."""
    X_train, _X_test, y_train, _y_test = get_dataset(name)

    X_train = np.asarray(X_train, dtype=np.float32)
    y_train = np.asarray(y_train)

    n = min(n_samples, X_train.shape[0])
    if n == 0:
        return []

    is_fashion = "fashion" in name.lower()
    indices = np.random.choice(X_train.shape[0], n, replace=False)
    samples = []
    for i in indices:
        label_num = str(y_train[i])
        display_label = FASHION_LABELS.get(label_num, label_num) if is_fashion else label_num
        samples.append({
            "image": X_train[i].tolist(),
            "label": display_label,
        })
    return samples
