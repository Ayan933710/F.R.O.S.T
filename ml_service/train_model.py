import os
import pandas as pd
import numpy as np
from xgboost import XGBClassifier
import joblib

MODEL_PATH = "xgboost_model.joblib"

def generate_mock_data(samples=2000):
    np.random.seed(42)
    
    # Generate features
    temperature = np.random.normal(-20, 10, samples) # -30 to -10 C
    humidity = np.random.uniform(40, 100, samples)
    U10 = np.random.exponential(5, samples) # wind speed 0 to 20+
    pressure_drop = np.random.normal(-1, 2, samples)
    
    target = np.zeros(samples)
    for i in range(samples):
        chance = 0.1
        if U10[i] > 12: chance += 0.4
        if pressure_drop[i] < -1.5: chance += 0.3
        if U10[i] > 15: chance += 0.5
        
        target[i] = 1 if np.random.rand() < chance else 0
        
    df = pd.DataFrame({
        'temperature': temperature,
        'humidity': humidity,
        'U10': U10,
        'pressure_drop': pressure_drop,
        'target': target
    })
    
    return df

def train_and_save():
    print("Generating mock AntAWS dataset...")
    df = generate_mock_data()
    X = df[['temperature', 'humidity', 'U10', 'pressure_drop']]
    y = df['target']
    
    model = XGBClassifier(n_estimators=100, random_state=42)
    model.fit(X, y)
    
    joblib.dump(model, MODEL_PATH)
    print(f"Model saved to {MODEL_PATH}")

if __name__ == "__main__":
    train_and_save()
