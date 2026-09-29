# F.R.O.S.T ML Service

A lightweight, dedicated Python microservice for predictive analytics and safety evaluations.

## Architecture

* **Framework:** FastAPI
* **Machine Learning:** Scikit-Learn / XGBoost (via `joblib`)
* **Data Processing:** Pandas

This service is decoupled from the Node.js backend to allow for dedicated GPU/Compute scaling and seamless integration with Python-native data science tooling. 

## The Model

The primary model (`xgboost_model.joblib`) is a gradient-boosted decision tree trained on historical meteorological and logistical data. 

**Transport Window Predictor (`/predict-window`)**
Evaluates current and forecasted weather conditions to determine if a transport/expedition window is safe.

**Failsafe Logic:**
The API implements a hybrid physics/ML approach. Before the ML model evaluates the inputs, a hard-coded physics failsafe evaluates extreme conditions. If wind speeds (`U10`) are $\ge 10$ m/s and the 3-hour pressure drop is $\le -2.0$ hPa, the system automatically flags the window as unsafe with 100% probability, overriding the ML model. 

## Getting Started

1. **Setup Virtual Environment:**
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```
2. **Install Dependencies:**
   ```bash
   pip install fastapi uvicorn pandas scikit-learn xgboost joblib
   ```
3. **Train Model (If needed):**
   ```bash
   python train_model.py
   ```
4. **Run API Server:**
   ```bash
   uvicorn main:app --reload --port 8000
   ```

## Endpoints

| Endpoint | Method | Parameters (Query) | Returns |
| :--- | :--- | :--- | :--- |
| `/health` | `GET` | None | `{ "status": "ok", "model_loaded": true }` |
| `/predict-window` | `GET` | `U10`, `pressure_drop`, `temperature`, `humidity`, `timestamp`, `station` | `{ "safe": bool, "probability": float, "reason": str, "inputs_used": dict }` |

## Backend Integration
The Node.js backend acts as a reverse proxy for this service. The frontend makes requests to the Node.js server (`/api/v1/ml/predict-window`), which then securely forwards the parameters to this FastAPI instance on port 8000.
