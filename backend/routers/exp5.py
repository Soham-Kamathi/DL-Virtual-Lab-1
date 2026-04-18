import json
import base64
import asyncio
from io import BytesIO
from PIL import Image
import numpy as np
import tensorflow as tf
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "exp5_trained_model.keras")

router = APIRouter(prefix="/api/exp5", tags=["Experiment 5 - CNNs"])

def array_to_base64_png(img_arr: np.ndarray) -> str:
    """Converts a numpy array image to base64 PNG string."""
    img = Image.fromarray(np.uint8(img_arr))
    buffered = BytesIO()
    img.save(buffered, format="PNG")
    return base64.b64encode(buffered.getvalue()).decode("utf-8")

class CNNParams(BaseModel):
    epochs: int = 5
    batch_size: int = 32
    learning_rate: float = 0.001
    dropout_rate: float = 0.25

@router.get("/dataset/preview")
def preview_dataset():
    """Load CIFAR-10, select 5 random images, return as base64."""
    try:
        (x_train, y_train), _ = tf.keras.datasets.cifar10.load_data()
        indices = np.random.choice(len(x_train), 5, replace=False)
        samples = [array_to_base64_png(x_train[idx]) for idx in indices]
        return {"samples": samples}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/run-stream")
async def run_simulation_stream(params: CNNParams):
    """Server-Sent Events (SSE) stream training a CNN natively."""
    (x_train, y_train), _ = tf.keras.datasets.cifar10.load_data()
    
    # Subsample to keep training tractable and fast for a virtual lab demo
    x_train_subset = x_train[:5000].astype("float32") / 255.0
    y_train_subset = y_train[:5000].flatten()
    
    train_dataset = tf.data.Dataset.from_tensor_slices((x_train_subset, y_train_subset)).batch(params.batch_size)

    # Dynamically build a CNN model
    model = tf.keras.Sequential([
        tf.keras.layers.InputLayer(shape=(32, 32, 3)),
        
        # Convolutional Block 1
        tf.keras.layers.Conv2D(32, (3, 3), padding='same', activation='relu'),
        tf.keras.layers.BatchNormalization(),
        tf.keras.layers.MaxPooling2D((2, 2)),
        tf.keras.layers.Dropout(params.dropout_rate),
        
        # Convolutional Block 2
        tf.keras.layers.Conv2D(64, (3, 3), padding='same', activation='relu'),
        tf.keras.layers.BatchNormalization(),
        tf.keras.layers.MaxPooling2D((2, 2)),
        tf.keras.layers.Dropout(params.dropout_rate),
        
        # Convolutional Block 3 (Deeper feature extraction)
        tf.keras.layers.Conv2D(128, (3, 3), padding='same', activation='relu'),
        tf.keras.layers.BatchNormalization(),
        tf.keras.layers.MaxPooling2D((2, 2)),
        tf.keras.layers.Dropout(params.dropout_rate),

        # Fully Connected Classifier
        tf.keras.layers.Flatten(),
        tf.keras.layers.Dense(128, activation='relu'),
        tf.keras.layers.BatchNormalization(),
        tf.keras.layers.Dropout(0.5), # Heavier dropout before the final decision
        tf.keras.layers.Dense(10)
    ])
    
    optimizer = tf.keras.optimizers.Adam(learning_rate=params.learning_rate)
    loss_fn = tf.keras.losses.SparseCategoricalCrossentropy(from_logits=True)
    train_acc_metric = tf.keras.metrics.SparseCategoricalAccuracy()

    async def event_generator():
        for epoch in range(params.epochs):
            total_loss = 0.0
            steps = 0
            
            for x_batch, y_batch in train_dataset:
                with tf.GradientTape() as tape:
                    logits = model(x_batch, training=True)
                    loss_value = loss_fn(y_batch, logits)
                
                # Retrieve gradients and update trainable weights
                grads = tape.gradient(loss_value, model.trainable_weights)
                optimizer.apply_gradients(zip(grads, model.trainable_weights))
                
                train_acc_metric.update_state(y_batch, logits)
                total_loss += float(loss_value)
                steps += 1
            
            avg_loss = total_loss / steps
            train_acc = float(train_acc_metric.result())
            train_acc_metric.reset_state() # Reset for the next epoch jump
            
            # Yield metrics as SSE chunk
            data_dict = {"epoch": epoch + 1, "loss": avg_loss, "accuracy": train_acc}
            yield f"data: {json.dumps(data_dict)}\n\n"
            
            # Push into asyncio event loop to ensure unblocking transmission
            await asyncio.sleep(0.01)

        model.save(MODEL_PATH)
        print(f"Model saved successfully at: {MODEL_PATH}")
            
    return StreamingResponse(event_generator(), media_type="text/event-stream")

@router.post("/extract-features")
def extract_feature_maps(image_data: dict = None):
    """Extracts intermediate filter maps from the REAL trained model."""
    if not os.path.exists(MODEL_PATH):
        raise HTTPException(status_code=400, detail="Please train the model first!")

    (x_train, _), _ = tf.keras.datasets.cifar10.load_data()
    test_img = x_train[0] # The frog image
    input_tensor = np.expand_dims(test_img.astype("float32") / 255.0, axis=0)

    # Load the real model
    trained_model = tf.keras.models.load_model(MODEL_PATH)
    
    # Create a partial model that stops at the first Conv2D layer
    # trained_model.layers[0] is the Conv2D layer in your upgraded architecture
    partial_model = tf.keras.models.Model(inputs=trained_model.inputs, outputs=trained_model.layers[0].output)
    
    feature_maps = partial_model.predict(input_tensor)[0]
    
    base64_maps = []
    # Loop over convolutions dimension (taking a max of 32 filters so we don't crash the UI)
    for i in range(min(feature_maps.shape[-1], 32)):
        fm = feature_maps[:, :, i]
        fm_min, fm_max = fm.min(), fm.max()
        if fm_max > fm_min:
            fm_norm = (fm - fm_min) / (fm_max - fm_min)
        else:
            fm_norm = fm
            
        fm_int = np.uint8(fm_norm * 255)
        img_pil = Image.fromarray(fm_int).resize((120, 120), Image.NEAREST)
        buffered = BytesIO()
        img_pil.save(buffered, format="PNG")
        b64_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
        base64_maps.append(b64_str)
        
    return {"layers": base64_maps}

@router.get("/confusion-matrix")
def get_confusion_matrix():
    """Generates a 10x10 confusion matrix using the LOCALLY SAVED trained model."""
    (_, _), (x_test, y_test) = tf.keras.datasets.cifar10.load_data()
    x_test_subset = x_test[:1000].astype("float32") / 255.0
    y_test_subset = y_test[:1000].flatten()
    
    # Check if the student has actually trained a model yet
    if not os.path.exists(MODEL_PATH):
        raise HTTPException(status_code=400, detail="Please click 'Start Training' and wait for it to finish first!")
        
    # Load the REAL trained model
    model = tf.keras.models.load_model(MODEL_PATH)
    
    logits = model.predict(x_test_subset)
    preds = np.argmax(logits, axis=1)
    
    cm = np.zeros((10, 10), dtype=int)
    for true_label, pred_label in zip(y_test_subset, preds):
        cm[true_label][pred_label] += 1
        
    return {"matrix": cm.tolist()}
