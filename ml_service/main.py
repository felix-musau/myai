from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import numpy as np
from sklearn import preprocessing
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
import joblib
import os

app = FastAPI(title='Dr AI ML Service')

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = 'model.joblib'

class PredictRequest(BaseModel):
    symptoms: dict

# Load or train model
if os.path.exists(MODEL_PATH):
    try:
        model, le, cols = joblib.load(MODEL_PATH)
    except:
        model = None
        le = None
        cols = []
else:
    try:
        training = pd.read_csv('../Training.csv')
        training.columns = training.columns.str.replace(r"\.\d+$", "", regex=True)
        training = training.loc[:, ~training.columns.duplicated()]
        cols = list(training.columns[:-1])
        x = training[cols]
        y = training['prognosis']
        le = preprocessing.LabelEncoder()
        y_enc = le.fit_transform(y)
        model = RandomForestClassifier(n_estimators=300, random_state=42)
        model.fit(x, y_enc)
        joblib.dump((model, le, cols), MODEL_PATH)
        print(f"Model trained and saved. Features: {len(cols)}")
    except Exception as e:
        print(f'Model training error: {e}')
        model = None
        le = None
        cols = []

@app.get('/health')
def health():
    return {'ok': True, 'model_loaded': model is not None}

@app.post('/predict')
def predict(req: PredictRequest):
    if model is None:
        raise HTTPException(status_code=503, detail='Model unavailable')
    
    try:
        # Convert symptom names to model feature indices
        row = [int(req.symptoms.get(c, 0)) for c in cols]
        pred = model.predict([row])[0]
        disease = str(le.classes_[pred])
        
        return {'disease': disease}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=8000)

