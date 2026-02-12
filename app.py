from flask import Flask, render_template, request, jsonify, session, send_from_directory, redirect, url_for
from flask_session import Session
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import re, random, pandas as pd, numpy as np, csv, warnings
from werkzeug.security import generate_password_hash, check_password_hash
from sklearn import preprocessing
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from difflib import get_close_matches
import os

warnings.filterwarnings("ignore", category=DeprecationWarning)

#  APP SETUP
app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'dr-ai-healthcare-secret-key-2024')

# Session Configuration
app.config["SESSION_TYPE"] = "filesystem"
app.config["SESSION_PERMANENT"] = False
Session(app)

# Database Configuration
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{os.path.join(basedir, "chatbot.db")}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

#  DATABASE MODELS
# New users table to manage authentication and roles
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='user')  # 'user' or 'admin'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


# Consultations now belong to users. Renamed table from `user_consultations` to `consultations`.
class Consultation(db.Model):
    __tablename__ = 'consultations'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    age = db.Column(db.Integer)
    gender = db.Column(db.String(20))
    predicted_disease = db.Column(db.String(200), nullable=False)
    symptoms = db.Column(db.Text)
    severity = db.Column(db.String(10))
    days = db.Column(db.String(50))
    pre_existing = db.Column(db.Text)
    lifestyle = db.Column(db.Text)
    family_history = db.Column(db.Text)
    confidence = db.Column(db.Float)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationship helper (optional)
    user = db.relationship('User', backref=db.backref('consultations', lazy=True))

#  LOAD ML MODEL
training = pd.read_csv("Training.csv")
testing = pd.read_csv("Testing.csv")
training.columns = training.columns.str.replace(r"\.\d+$", "", regex=True)
testing.columns = testing.columns.str.replace(r"\.\d+$", "", regex=True)
training = training.loc[:, ~training.columns.duplicated()]
testing = testing.loc[:, ~testing.columns.duplicated()]

cols = training.columns[:-1]
x = training[cols]
y = training['prognosis']
le = preprocessing.LabelEncoder()
y = le.fit_transform(y)
x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=0.33, random_state=42)
model = RandomForestClassifier(n_estimators=300, random_state=42)
model.fit(x_train, y_train)

# Disease mapping
disease_map = {idx: disease for idx, disease in enumerate(le.classes_)}
symptoms_dict = {symptom: idx for idx, symptom in enumerate(x.columns)}

#  LOAD DATA FILES 
severityDictionary, description_list, precautionDictionary = {}, {}, {}

def load_data():
    with open("symptom_Description.csv") as csv_file:
        for row in csv.reader(csv_file):
            if len(row) < 2:
                continue
            description_list[row[0].strip()] = row[1].strip()

    with open("Symptom_severity.csv") as csv_file:
        for row in csv.reader(csv_file):
            if len(row) < 2:
                continue
            try:
                severityDictionary[row[0].strip()] = int(row[1])
            except ValueError:
                pass

    with open("symptom_precaution.csv") as csv_file:
        for row in csv.reader(csv_file):
            if len(row) < 5:
                continue
            precautionDictionary[row[0].strip()] = [row[1], row[2], row[3], row[4]]

load_data()

#  SYMPTOM SYNONYMS
symptom_synonyms = {
    "stomach ache": "stomach_pain", "belly pain": "stomach_pain", "tummy pain": "stomach_pain",
    "cramps": "muscle_cramps", "bloating": "bloating", "nausea": "nausea", "vomiting": "vomiting",
    "throwing up": "vomiting", "diarrhea": "diarrhoea", "loose motion": "diarrhoea",
    "constipation": "constipation", "heartburn": "acidity", "acid reflux": "acidity",
    "indigestion": "indigestion", "gas": "bloating", "loss of appetite": "loss_of_appetite",
    "weight loss": "weight_loss", "weight gain": "weight_gain", "fever": "high_fever",
    "high temperature": "high_fever", "cough": "cough", "sore throat": "throat_irritation",
    "headache": "headache", "dizziness": "dizziness", "fatigue": "fatigue", "weakness": "weakness_in_limbs",
    "chest pain": "chest_pain", "shortness of breath": "breathlessness", "difficulty breathing": "breathlessness",
    "chills": "chills", "sweating": "sweating", "joint pain": "joint_pain", "muscle pain": "muscle_pain",
    "back pain": "back_pain", "neck pain": "neck_pain", "eye pain": "redness_of_eyes",
    "itching": "itching", "rash": "skin_rash", "anxiety": "anxiety", "depression": "depression",
    "insomnia": "insomnia", "stress": "anxiety", "hair loss": "loss_of_smell",
}

# RANDOM FACTS 
body_facts = [
    "Your heart beats about 100,000 times per day ❤️",
    "You have about 37.2 trillion cells in your body 🧬",
    "Your bones are stronger than steel 💪",
    "You lose about 30,000 skin cells every minute 🧴",
    "Your nose can remember 50,000 different scents 👃",
    "Your tongue has about 10,000 taste buds 👅",
    "Your brain uses 20% of your body's energy 🧠",
    "You blink about 17,000 times a day 👀",
    "Your liver has over 500 functions 🫀",
    "You produce about 25,000 quarts of saliva yearly 💧",
    "Your lungs have a surface area of about 70 square meters 🫁",
    "Your fingernails grow faster in winter ⚡",
    "You have about 60,000 miles of blood vessels 🩸",
    "Your stomach produces a new lining every 3-5 days 🍽️",
    "You use 200 muscles to take a single step 🚶",
    "Your DNA is 99.9% identical to other humans 🧬",
    "Your ears never stop growing throughout your life 👂",
    "You get a new skeleton every 10 years 🦴",
    "Your body produces new red blood cells every second ♦️",
    "Your vision accounts for 30% of your brain's cortex 👁️",
    "The heart pumps roughly 7,000–8,000 liters of blood per day 🫀",
    "Your skin is the largest organ of your body 🌍",
    "Your body has more than 600 muscles 💪",
    "Your brain can generate about 23 watts of power when awake ⚡",
    "Your intestines are about 25 feet long 🦠",
    "Your body contains enough iron to make a small nail 🔩",
    "Your body has over 100,000 miles of nerves 🧠",
    "Your taste buds have a lifespan of about 10 days 👅",
    "Your body has more bacteria than human cells 🦠",
    "Your blood makes up about 8% of your total body weight 🩸",
    "Your bones are constantly being remodeled throughout your life 🦴",
    "Your brain is about 75% water 💧",
    "Your body can survive without food for weeks, but only a few days without water 🚱",
    "Your hair grows about 0.5 inches per month 💇",
    "Your body has about 5 million hairs on it 🧑‍🦰"
    "The lungs provide a surface area roughly the size of a tennis court 🎾",
    "Your kidneys filter about 50 gallons of blood daily 🩸",
    "Your body has over 650 skeletal muscles 💪",
    "Your brain contains around 86 billion neurons 🧠",
    "Your skin renews itself approximately every 28 days 🧴",
    "Your body has more than 230 movable and semi-movable joints 🤸",
    "Your heart creates enough pressure to squirt blood up to 30 feet 🫀",
    "Your body produces about 1 to 1.5 liters of mucus daily 🤧",
    "Your bones are made up of 25% water 💧",
    "Your body has about 2 to 5 million sweat glands 🌡️",
    "Your brain's storage capacity is considered virtually limitless 🧠",
    "Your body has about 20 square feet of skin surface area 🧴",
    "Your liver can regenerate itself even if 75% is removed 🫀",
    "Your body has over 100,000 hair follicles on your scalp alone 🧑‍🦰",
    "Your body can produce vitamin D when exposed to sunlight ☀️",
    "Your bones are constantly producing new blood cells in the marrow 🦴",
    "Your body has about 650 skeletal muscles 💪",
    "Your brain processes information at speeds up to 120 meters per second ⚡",
    
]

# HELPER FUNCTIONS
def extract_symptoms(text, available_symptoms):
    text = text.lower()
    found_symptoms = []
    
    for synonym, standard in symptom_synonyms.items():
        if synonym in text:
            found_symptoms.append(standard)
    
    for symptom in available_symptoms:
        symptom_clean = symptom.replace('_', ' ').lower()
        if symptom_clean in text:
            found_symptoms.append(symptom)
    
    return list(set(found_symptoms))

def predict_disease(symptoms_list):
    input_vector = [0] * len(cols)
    for symptom in symptoms_list:
        if symptom in symptoms_dict:
            input_vector[symptoms_dict[symptom]] = 1
    
    prediction = model.predict([input_vector])[0]
    confidence = model.predict_proba([input_vector])[0][prediction]
    disease = disease_map[prediction]
    
    return disease, confidence, input_vector

def get_clarifying_questions(disease, current_symptoms):
    """Get max 3 clarifying questions for the disease"""
    disease_row = training[training['prognosis'] == disease]
    if disease_row.empty:
        return []
    
    all_disease_symptoms = list(disease_row.iloc[0][:-1].index[
        disease_row.iloc[0][:-1] == 1
    ])
    
    missing_symptoms = [s for s in all_disease_symptoms if s not in current_symptoms]
    return missing_symptoms[:3]

#  ROUTES 
@app.route('/')
def index():
    # Require login to access the chat. Redirect to login if not authenticated.
    if not session.get('user_id'):
        return redirect(url_for('login'))
    
    # Initialize conversation step if not set
    if 'step' not in session:
        session['step'] = 'welcome'
    return render_template('index.html')

@app.route('/reset')
def reset():
    session.clear()
    session['step'] = 'welcome'
    return jsonify(success=True)

@app.route('/history')
def history():
    # Require login to view history. Admins can view all consultations.
    user_id = session.get('user_id')
    role = session.get('role')
    if not user_id:
        return redirect(url_for('login'))

    if role == 'admin':
        consultations = Consultation.query.order_by(Consultation.created_at.desc()).all()
    else:
        consultations = Consultation.query.filter_by(user_id=user_id).order_by(Consultation.created_at.desc()).all()

    return render_template('history.html', consultations=consultations)

@app.route('/fact')
def get_fact():
    return jsonify(fact=random.choice(body_facts))

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_msg = data.get('message', '').strip()
    step = session.get('step', 'welcome')
    
    if not user_msg:
        return jsonify(reply="Please enter a message.")
    
    user_msg_lower = user_msg.lower()
    greetings = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'morning', 'afternoon', 'evening']
    
    # WELCOME STEP 
    if step == 'welcome' or any(greet in user_msg_lower for greet in greetings):
        session['step'] = 'name'
        session['symptoms'] = []
        return jsonify(reply="👋 Hello! I'm MyAI, your healthcare assistant.\n✨ Welcome to the HealthCare ChatBot!\n➡️ What is your name?")
    
    #  NAME STEP 
    elif step == 'name':
        session['name'] = user_msg
        session['step'] = 'age'
        return jsonify(reply=f"🥼 Nice to meet you, {session['name']}! How old are you?")
    
    #  AGE STEP 
    elif step == 'age':
        try:
            age = int(user_msg)
            if age <= 0 or age > 120:
                return jsonify(reply="⚠️ Please enter a valid age between 1 and 120.")
            session['age'] = age
        except ValueError:
            return jsonify(reply="⚠️ Age must be a number. Please try again.")
        
        session['step'] = 'gender'
        return jsonify(reply=f"🥼 What is your gender, {session['name']}? (Male/Female/Other)")
    
    # GENDER STEP 
    elif step == 'gender':
        gender = user_msg.strip().lower()
        if gender not in ['male', 'female', 'other', 'm', 'f', 'o']:
            return jsonify(reply="⚠️ Please enter Male, Female, or Other.")
        session['gender'] = gender
        session['step'] = 'symptoms'
        return jsonify(reply=f"🥼 Please describe your symptoms in a few words (e.g., 'I have a fever and cough')")
    
    # SYMPTOMS STEP
    elif step == 'symptoms':
        symptoms_list = extract_symptoms(user_msg, list(cols))
        if not symptoms_list:
            return jsonify(reply="Sorry, I couldn't recognize those symptoms. Please try again (e.g., fever, cough, headache)")
        
        session['symptoms'] = symptoms_list
        disease, conf, _ = predict_disease(symptoms_list)
        session['pred_disease'] = disease
        session['confidence'] = float(conf)
        session['step'] = 'duration'
        
        return jsonify(reply=f"✅ Detected symptoms: {', '.join([s.replace('_', ' ') for s in symptoms_list])}\n👉 For how many days have you had these symptoms?")
    
    #  DURATION STEP
    elif step == 'duration':
        session['days'] = user_msg
        session['step'] = 'severity'
        return jsonify(reply=f"🥼 On a scale of 1-10, how severe is your condition?")
    
    # SEVERITY STEP
    elif step == 'severity':
        session['severity'] = user_msg
        session['step'] = 'preexist'
        return jsonify(reply="🥼 Do you have any pre-existing medical conditions? (e.g., diabetes, heart disease)")
    
    #  PRE-EXISTING STEP
    elif step == 'preexist':
        session['preexist'] = user_msg
        session['step'] = 'lifestyle'
        return jsonify(reply="🥼 Do you smoke, drink alcohol, or have irregular sleep patterns?")
    
    # ==================== LIFESTYLE STEP =
    elif step == 'lifestyle':
        session['lifestyle'] = user_msg
        session['step'] = 'family'
        return jsonify(reply="🥼 Is there any family history of similar illnesses?")
    
    #  FAMILY HISTORY STEP
    elif step == 'family':
        session['family'] = user_msg
        
        # Get clarifying questions (max 3)
        clarifying_questions = get_clarifying_questions(session['pred_disease'], session['symptoms'])
        session['clarifying_questions'] = clarifying_questions
        session['clarify_index'] = 0
        
        if clarifying_questions:
            session['step'] = 'clarify'
            return ask_clarifying_question()
        else:
            session['step'] = 'final'
            return final_prediction()
    
    # CLARIFYING QUESTIONS STEP
    elif step == 'clarify':
        idx = session.get('clarify_index', 0) - 1
        if idx >= 0 and idx < len(session.get('clarifying_questions', [])):
            if user_msg_lower in ['yes', 'y']:
                session['symptoms'].append(session['clarifying_questions'][idx])
        
        session['clarify_index'] = session.get('clarify_index', 0) + 1
        
        if session['clarify_index'] > len(session.get('clarifying_questions', [])):
            session['step'] = 'final'
            return final_prediction()
        else:
            return ask_clarifying_question()
    
    #  FINAL STEP 
    elif step == 'final':
        return final_prediction()
    
    return jsonify(reply="Sorry, I didn't understand that. Please try again.")

def ask_clarifying_question():
    clarifying_questions = session.get('clarifying_questions', [])
    idx = session.get('clarify_index', 0)
    
    if idx < len(clarifying_questions):
        symptom = clarifying_questions[idx].replace('_', ' ')
        return jsonify(reply=f"🥼 Do you experience {symptom}? (yes/no)")
    else:
        session['step'] = 'final'
        return final_prediction()

def final_prediction():
    disease, conf, _ = predict_disease(session.get('symptoms', []))
    session['pred_disease'] = disease
    session['confidence'] = float(conf)
    
    about = description_list.get(disease, 'No detailed description available.')
    precautions = precautionDictionary.get(disease, [])
    
    text = f"🩺 **Diagnosis Result**\n\n"
    text += f"Based on your symptoms, you are likely suffering from:\n**{disease}**\n\n"
    text += f"📊 Confidence: {conf*100:.1f}%\n\n"
    text += f"📝 **About this condition:**\n{about}\n\n"
    
    if precautions:
        text += "💊 **Recommended Precautions:**\n"
        for i, p in enumerate(precautions, 1):
            text += f"{i}. {p}\n"
    
    text += f"\n⚠️ **Please consult a healthcare professional for proper diagnosis and treatment.**\n"
    # Prefer authenticated username if available, otherwise fall back to chat-collected name
    display_name = session.get('username') or session.get('name') or 'User'
    text += f"\nThank you for using MyAI, {display_name}! 🙏"
    
    # Save to database: only save if a logged-in user exists. This ensures every consultation
    # belongs to a user and prevents trusting frontend identity.
    try:
        user_id = session.get('user_id')
        if user_id:
            consultation = Consultation(
                user_id=user_id,
                age=session.get('age'),
                gender=session.get('gender'),
                predicted_disease=disease,
                symptoms=', '.join(session.get('symptoms', [])),
                severity=session.get('severity'),
                days=session.get('days'),
                pre_existing=session.get('preexist'),
                lifestyle=session.get('lifestyle'),
                family_history=session.get('family'),
                confidence=conf
            )
            db.session.add(consultation)
            db.session.commit()
        else:
            # Do not save anonymous consultations. Encourage the user to register/login to save history.
            text += "\n\n🔐 To save this consultation to your history, please register or log in."
    except Exception as e:
        print(f"Database error: {e}")
    
    return jsonify(reply=text)

# CASUAL CONVERSATION HANDLER 
@app.route('/handle-casual', methods=['POST'])
def handle_casual():
    user_msg = request.json.get('message', '').lower()
    
    farewells = ['bye', 'goodbye', 'see you', 'take care', 'farewell', 'later']
    thanks = ['thank you', 'thanks', 'thx', 'thank you very much']
    
    if any(f in user_msg for f in farewells):
        return jsonify(is_casual=True, reply="👋 Goodbye! Take care and stay healthy! 🏥")
    
    if any(t in user_msg for t in thanks):
        return jsonify(is_casual=True, reply="😊 You're welcome! Feel free to reach out anytime. 💙")
    
    return jsonify(is_casual=False)

#  ERROR HANDLERS 
@app.route('/hospitals')
def hospitals():
    return render_template('hospitals.html')


# Serve ai.jpg from project root so templates can reference /ai.jpg without moving files
@app.route('/ai.jpg')
def serve_ai_image():
    return send_from_directory(basedir, 'ai.jpg')

@app.route('/contact')
def contact():
    return render_template('contact.html')


# ---------------------- Authentication Routes ----------------------
@app.route('/register', methods=['GET', 'POST'])
def register():
    """Register a new user. Passwords are hashed using werkzeug's generate_password_hash.
    Minimal checks are performed: username uniqueness and non-empty password.
    After successful registration the user is logged in (session stores user_id and role).
    """
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '').strip()

        if not username or not password:
            return render_template('register.html', error='Username and password are required')

        existing = User.query.filter_by(username=username).first()
        if existing:
            return render_template('register.html', error='Username already taken')

        pw_hash = generate_password_hash(password)
        user = User(username=username, password_hash=pw_hash, role='user')
        db.session.add(user)
        db.session.commit()

        # Log the user in
        session['user_id'] = user.id
        session['role'] = user.role
        session['username'] = user.username
        return redirect(url_for('index'))

    return render_template('register.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    """Login existing users. Uses check_password_hash to verify passwords.
    Stores `session['user_id']` and `session['role']` on success.
    """
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '').strip()

        user = User.query.filter_by(username=username).first()
        if not user or not check_password_hash(user.password_hash, password):
            return render_template('login.html', error='Invalid credentials')

        session['user_id'] = user.id
        session['role'] = user.role
        session['username'] = user.username
        return redirect(url_for('index'))

    return render_template('login.html')


@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))


@app.route('/send-message', methods=['POST'])
def send_message():
    data = request.json
    name = data.get('name', '')
    email = data.get('email', '')
    message = data.get('message', '')
    
    # In production, you'd send an email here
    # For now, just return success
    return jsonify(success=True, message="Thank you! We'll get back to you soon.")

@app.errorhandler(404)
def not_found(error):
    return jsonify(error="Page not found"), 404

@app.errorhandler(500)
def server_error(error):
    return jsonify(error="Server error"), 500

# CREATE TABLES
with app.app_context():
    db.create_all()

# RUN APP
if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)
