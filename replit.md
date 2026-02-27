# MyAI Healthcare Chatbot

## Overview
A healthcare chatbot application built with Flask that uses machine learning (Random Forest Classifier) to predict diseases based on user-reported symptoms. The app guides users through a conversational flow to collect symptoms, health information, and provides a diagnosis with precautions.

## Project Structure
- `app.py` - Main Flask application with routes, ML model, and chatbot logic
- `templates/` - HTML templates (index.html, history.html, hospitals.html, contact.html)
- `Training.csv` / `Testing.csv` - ML training and testing datasets
- `symptom_Description.csv` - Disease descriptions
- `symptom_precaution.csv` - Disease precaution recommendations  
- `Symptom_severity.csv` - Symptom severity data
- `chatbot.db` - SQLite database for storing user consultations
- `ai.jpg` - Bot avatar image

## Tech Stack
- **Backend**: Python 3.11, Flask
- **Database**: SQLite with Flask-SQLAlchemy
- **ML**: scikit-learn (Random Forest Classifier)
- **Session**: Flask-Session (filesystem-based)
- **Data Processing**: pandas, numpy

## Key Features
- Conversational symptom checker
- Disease prediction with confidence scores
- User consultation history
- Hospital finder page
- Contact form
- Random body facts display

## Running the App
The app runs on port 5000 with the Flask development server:
```
python app.py
```

## Deployment
For production, use gunicorn:
```
gunicorn --bind=0.0.0.0:5000 app:app
```
