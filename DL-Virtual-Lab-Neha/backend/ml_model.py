import requests
import datetime
import yfinance as yf
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_squared_error

class LSTMModel(nn.Module):
    def __init__(self, input_size=1, hidden_size=50, num_layers=1, output_size=1):
        super(LSTMModel, self).__init__()
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True)
        self.fc = nn.Linear(hidden_size, output_size)

    def forward(self, x):
        h0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size).to(x.device)
        c0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size).to(x.device)
        out, _ = self.lstm(x, (h0, c0))
        out = self.fc(out[:, -1, :])
        return out

def create_sequences(data, seq_length):
    xs = []
    ys = []
    for i in range(len(data) - seq_length):
        x = data[i:(i + seq_length)]
        y = data[i + seq_length]
        xs.append(x)
        ys.append(y)
    return np.array(xs), np.array(ys)

def run_lstm_simulation(dataset_name: str, window_size: int, num_layers: int):
    # 1. Fetch Data
    if dataset_name.lower() in ['google', 'tesla']:
        ticker = 'GOOGL' if dataset_name.lower() == 'google' else 'TSLA'
        df = yf.download(ticker, period='2y')
        close_col = df['Close']
        if isinstance(close_col, pd.DataFrame):
            close_col = close_col.iloc[:, 0]
        data = close_col.values.reshape(-1, 1)
    else:
        # Mumbai Weather via Open-Meteo
        end_date_obj = datetime.datetime.now() - datetime.timedelta(days=10)
        start_date_obj = end_date_obj - datetime.timedelta(days=730)
        end_date = end_date_obj.strftime('%Y-%m-%d')
        start_date = start_date_obj.strftime('%Y-%m-%d')
        
        url = "https://archive-api.open-meteo.com/v1/archive"
        params = {
            "latitude": 19.0760,
            "longitude": 72.8777,
            "start_date": start_date,
            "end_date": end_date,
            "daily": "temperature_2m_mean",
            "timezone": "auto"
        }
        resp = requests.get(url, params=params)
        resp.raise_for_status()
        json_data = resp.json()
        
        daily_temp = json_data['daily']['temperature_2m_mean']
        temps = [t for t in daily_temp if t is not None]
        data = np.array(temps).reshape(-1, 1)
    
    # 2. Scale Data
    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled_data = scaler.fit_transform(data)
    
    # 3. Create sliding window sequences
    X, y = create_sequences(scaled_data, window_size)
    
    # Split train/test (80/20)
    split_idx = int(len(X) * 0.8)
    X_train, y_train = X[:split_idx], y[:split_idx]
    X_test, y_test = X[split_idx:], y[split_idx:]
    
    X_train_t = torch.tensor(X_train, dtype=torch.float32)
    y_train_t = torch.tensor(y_train, dtype=torch.float32)
    X_test_t = torch.tensor(X_test, dtype=torch.float32)
    
    # 4. Define Model, Loss, Optimizer
    model = LSTMModel(input_size=1, hidden_size=50, num_layers=num_layers, output_size=1)
    criterion = nn.MSELoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=0.01)
    
    # 5. Train Model
    epochs = 75
    loss_curve = []
    
    model.train()
    for epoch in range(epochs):
        optimizer.zero_grad()
        outputs = model(X_train_t)
        loss = criterion(outputs, y_train_t)
        loss.backward()
        optimizer.step()
        loss_curve.append(loss.item())
        
    # 6. Evaluate
    model.eval()
    with torch.no_grad():
        test_predictions = model(X_test_t)
        
    # Inverse transform
    predicted_prices = scaler.inverse_transform(test_predictions.numpy()).flatten()
    actual_prices = scaler.inverse_transform(y_test).flatten()
    
    # Calculate metrics
    mse = mean_squared_error(actual_prices, predicted_prices)
    rmse = np.sqrt(mse)
    
    return {
        "loss_curve": loss_curve,
        "actual_prices": actual_prices.tolist(),
        "predicted_prices": predicted_prices.tolist(),
        "mse": float(mse),
        "rmse": float(rmse)
    }
