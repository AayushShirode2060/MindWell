import joblib
import os
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.metrics import classification_report
from data.training_data import TRAINING_DATA

print("🧠 MindWell ML — Training Mood Classifier")
print(f"📊 Dataset: {len(TRAINING_DATA)} samples")
print("-" * 40)

# Separate features and labels
texts = [d[0] for d in TRAINING_DATA]
mood_labels = [d[1] for d in TRAINING_DATA]
severity_scores = [d[2] for d in TRAINING_DATA]

# TF-IDF Vectorization
print("📝 Vectorizing text with TF-IDF...")
vectorizer = TfidfVectorizer(
    max_features=5000,      # Top 5000 words
    ngram_range=(1, 2),     # Unigrams + bigrams (e.g., "can't sleep")
    stop_words='english',   # Remove common words (the, is, at)
    min_df=1,               # Minimum document frequency
    sublinear_tf=True       # Apply log normalization
)
X = vectorizer.fit_transform(texts)
print(f"✅ Feature matrix shape: {X.shape}")

# --- MOOD CLASSIFIER ---
print("\n🎯 Training Mood Classifier (Logistic Regression)...")
mood_model = LogisticRegression(
    max_iter=1000,
    C=1.0,                  # Regularization strength
    class_weight='balanced', # Handle imbalanced classes
    random_state=42
)

# Cross-validation
scores = cross_val_score(mood_model, X, mood_labels, cv=3, scoring='accuracy')
print(f"📈 Cross-val accuracy: {scores.mean():.2f} (+/- {scores.std():.2f})")

# Train on full data
mood_model.fit(X, mood_labels)

# --- SEVERITY MODEL ---
print("\n🎯 Training Severity Scorer (Logistic Regression)...")
severity_model = LogisticRegression(
    max_iter=1000,
    C=1.0,
    random_state=42
)
severity_model.fit(X, severity_scores)

# --- EVALUATION ---
print("\n📋 Classification Report:")
mood_predictions = mood_model.predict(X)
print(classification_report(mood_labels, mood_predictions))

# --- SAVE MODELS ---
os.makedirs('model', exist_ok=True)
joblib.dump(vectorizer, 'model/tfidf_vectorizer.pkl')
joblib.dump(mood_model, 'model/mood_classifier.pkl')
joblib.dump(severity_model, 'model/severity_scorer.pkl')

print("\n✅ Models saved to model/ folder!")
print("   - tfidf_vectorizer.pkl")
print("   - mood_classifier.pkl")
print("   - severity_scorer.pkl")

# --- TEST ---
print("\n🧪 Quick Test:")
test_texts = [
    "I feel so anxious about my exams",
    "I want to end my life",
    "I had a great day today",
    "I can't sleep at all",
    "I'm so angry at everyone"
]

X_test = vectorizer.transform(test_texts)
moods = mood_model.predict(X_test)
probas = mood_model.predict_proba(X_test)
severities = severity_model.predict(X_test)

for text, mood, proba, sev in zip(test_texts, moods, probas, severities):
    confidence = max(proba) * 100
    print(f"  '{text}' → mood={mood}, confidence={confidence:.0f}%, severity={sev}")
