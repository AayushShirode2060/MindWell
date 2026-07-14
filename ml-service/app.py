from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib

app = Flask(__name__)
CORS(app)

# Load saved models
vectorizer = joblib.load('model/tfidf_vectorizer.pkl')
mood_model = joblib.load('model/mood_classifier.pkl')
severity_model = joblib.load('model/severity_scorer.pkl')

# Mood → Frequency mapping
FREQUENCY_MAP = {
    'anxiety': {'freq': '432Hz', 'name': 'Calming Solfeggio', 'type': 'solfeggio'},
    'sadness': {'freq': '528Hz', 'name': 'Healing Frequency', 'type': 'solfeggio'},
    'anger':   {'freq': '2Hz Delta', 'name': 'Deep Relaxation', 'type': 'binaural'},
    'stress':  {'freq': '10Hz Alpha', 'name': 'Relaxed Focus', 'type': 'binaural'},
    'insomnia':{'freq': '3Hz Delta', 'name': 'Sleep Induction', 'type': 'binaural'},
    'crisis':  {'freq': '432Hz', 'name': 'Calming Solfeggio', 'type': 'solfeggio'},
}

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    text = data.get('text', '')
    
    if not text.strip():
        return jsonify({'error': 'Text is required'}), 400
    
    # Vectorize
    X = vectorizer.transform([text])
    
    # Predict mood
    mood = mood_model.predict(X)[0]
    mood_proba = mood_model.predict_proba(X)[0]
    confidence = float(max(mood_proba)) * 100
    
    # Predict severity
    severity = int(severity_model.predict(X)[0])
    
    # Get frequency
    frequency = FREQUENCY_MAP.get(mood, None)
    
    return jsonify({
        'mood': mood,
        'confidence': round(confidence, 1),
        'severity': severity,
        'frequency': frequency,
        'isCrisis': mood == 'crisis'
    })

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'model': 'MindWell Mood Classifier v1'})

if __name__ == '__main__':
    print("🧠 MindWell ML Service running on http://localhost:5001")
    app.run(port=5001, debug=True)
