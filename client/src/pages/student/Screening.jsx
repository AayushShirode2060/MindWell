import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { screeningEndpoints } from '../../api/endpoints';
import { ClipboardCheck, ArrowRight, Brain, AlertTriangle, Clock } from 'lucide-react';
import { PHQ9_QUESTIONS, GAD7_QUESTIONS, ANSWER_OPTIONS } from '../../data/screeningQuestions';

const severityColor = {
  'Minimal': 'bg-emerald-100 text-emerald-700',
  'Mild': 'bg-yellow-100 text-yellow-700',
  'Moderate': 'bg-orange-100 text-orange-700',
  'Moderately Severe': 'bg-red-100 text-red-700',
  'Severe': 'bg-red-200 text-red-800',
};

const Screening = () => {
  const [view, setView] = useState('select');  // 'select' | 'quiz' | 'result'
  const [testType, setTestType] = useState('');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchHistory(); }, []);

  const fetchHistory = async () => {
    try {
      const res = await API.get(screeningEndpoints.GET_MY_SCREENINGS_API);
      setHistory(res.data.screenings);
    } catch (err) { console.error(err); }
  };

  const questions = testType === 'PHQ-9' ? PHQ9_QUESTIONS : GAD7_QUESTIONS;

  const startTest = (type) => {
    setTestType(type);
    setCurrentQ(0);
    setAnswers([]);
    setResult(null);
    setError('');
    setView('quiz');
  };

  const selectAnswer = (score) => {
    const newAnswers = [...answers];
    newAnswers[currentQ] = { questionIndex: currentQ, score };
    setAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (answers[currentQ] === undefined) { setError('Please select an answer'); return; }
    setError('');
    if (currentQ < questions.length - 1) {
      setCurrentQ(prev => prev + 1);
    } else {
      submitTest();
    }
  };

  const prevQuestion = () => {
    if (currentQ > 0) setCurrentQ(prev => prev - 1);
    setError('');
  };

  const submitTest = async () => {
    setLoading(true);
    try {
      const res = await API.post(screeningEndpoints.SUBMIT_SCREENING_API, { type: testType, answers });
      setResult(res.data.screening);
      setView('result');
      fetchHistory();
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed');
    } finally { setLoading(false); }
  };

  // ========== SELECT VIEW ==========
  if (view === 'select') return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-text-main">Self-Assessment</h1>
        <p className="text-text-muted mt-1">Take a quick, confidential mental health screening</p>
      </div>

      {/* Test Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-white rounded-2xl p-6 border border-border-custom hover:shadow-md transition-all">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-2xl mb-4">🧠</div>
          <h3 className="text-xl font-bold mb-1">PHQ-9</h3>
          <p className="text-sm text-text-light mb-1">Depression Screening</p>
          <p className="text-xs text-text-muted mb-4 flex items-center gap-1"><Clock size={12} /> 9 questions · ~3 min</p>
          <button onClick={() => startTest('PHQ-9')}
            className="px-5 py-2.5 rounded-full bg-primary text-dark font-semibold text-sm hover:shadow-glow transition-all flex items-center gap-2">
            Start Assessment <ArrowRight size={16} />
          </button>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-border-custom hover:shadow-md transition-all">
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-2xl mb-4">💭</div>
          <h3 className="text-xl font-bold mb-1">GAD-7</h3>
          <p className="text-sm text-text-light mb-1">Anxiety Screening</p>
          <p className="text-xs text-text-muted mb-4 flex items-center gap-1"><Clock size={12} /> 7 questions · ~2 min</p>
          <button onClick={() => startTest('GAD-7')}
            className="px-5 py-2.5 rounded-full bg-primary text-dark font-semibold text-sm hover:shadow-glow transition-all flex items-center gap-2">
            Start Assessment <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div>
          <h3 className="text-lg font-bold mb-4">Previous Results</h3>
          <div className="flex flex-col gap-2">
            {history.map(s => (
              <div key={s._id} className="flex items-center gap-4 px-5 py-4 bg-white border border-border-custom rounded-xl hover:shadow-sm transition-all">
                <div className="text-2xl">{s.type === 'PHQ-9' ? '🧠' : '💭'}</div>
                <div className="flex-1">
                  <div className="font-semibold text-sm">{s.type}</div>
                  <div className="text-xs text-text-muted">
                    {new Date(s.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
                <div className="text-xl font-extrabold">{s.totalScore}</div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${severityColor[s.severity]}`}>
                  {s.severity}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // ========== QUIZ VIEW ==========
  if (view === 'quiz') return (
    <div>
      <div className="mb-6">
        <button onClick={() => setView('select')} className="text-sm text-text-muted hover:text-text-main mb-2 bg-transparent border-none cursor-pointer">
          ← Back to assessments
        </button>
        <h1 className="text-2xl font-extrabold tracking-tight">{testType} {testType === 'PHQ-9' ? 'Depression' : 'Anxiety'} Screening</h1>
        <p className="text-text-muted text-sm mt-1">Over the last 2 weeks, how often have you been bothered by the following?</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-text-muted mb-2">
          <span>Question {currentQ + 1} of {questions.length}</span>
          <span>{Math.round(((currentQ + 1) / questions.length) * 100)}%</span>
        </div>
        <div className="w-full h-2.5 bg-border-custom rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} />
        </div>
      </div>

      {/* Question */}
      <div className="bg-white rounded-2xl p-8 border border-border-custom shadow-sm mb-6">
        <p className="text-lg font-semibold mb-6">{questions[currentQ]}</p>

        {error && <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm mb-4">{error}</div>}

        <div className="flex flex-col gap-3">
          {ANSWER_OPTIONS.map((opt) => (
            <button key={opt.score} type="button" onClick={() => selectAnswer(opt.score)}
              className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all duration-200 cursor-pointer text-sm font-medium
              ${answers[currentQ]?.score === opt.score
                ? 'border-primary bg-primary/10 text-text-main'
                : 'border-border-custom bg-white hover:border-dark text-text-light'}`}>
              <span className="font-bold mr-2">{opt.score}.</span> {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button onClick={prevQuestion} disabled={currentQ === 0}
          className="px-5 py-2.5 rounded-full border-2 border-border-custom text-sm font-semibold hover:border-dark transition-all disabled:opacity-40 bg-transparent cursor-pointer">
          ← Back
        </button>
        <button onClick={nextQuestion} disabled={loading}
          className="px-6 py-2.5 rounded-full bg-primary text-dark text-sm font-semibold hover:shadow-glow transition-all flex items-center gap-2 disabled:opacity-60">
          {loading ? <div className="w-4 h-4 border-2 border-dark/30 border-t-dark rounded-full animate-spin" /> :
            currentQ < questions.length - 1 ? <>Next <ArrowRight size={16} /></> : 'Submit'}
        </button>
      </div>
    </div>
  );

  // ========== RESULT VIEW ==========
  if (view === 'result' && result) return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight">Your Results</h1>
      </div>

      <div className="bg-white rounded-2xl p-8 border border-border-custom shadow-sm mb-6 text-center">
        <div className="text-6xl font-black text-text-main mb-2">{result.totalScore}</div>
        <div className="text-sm text-text-muted mb-4">out of {testType === 'PHQ-9' ? 27 : 21}</div>
        <span className={`text-sm font-bold px-4 py-2 rounded-full ${severityColor[result.severity]}`}>
          {result.severity}
        </span>

        {/* Score Meaning */}
        <div className="mt-8 text-left bg-surface rounded-xl p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm mb-1">Recommendation</p>
              <p className="text-sm text-text-light">{result.recommendation}</p>
            </div>
          </div>
        </div>

        {/* Score Ranges */}
        <div className="mt-6 text-left">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Score Ranges for {testType}</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {testType === 'PHQ-9' ? (
              <>
                <div className="px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700">0-4: Minimal</div>
                <div className="px-3 py-2 rounded-lg bg-yellow-50 text-yellow-700">5-9: Mild</div>
                <div className="px-3 py-2 rounded-lg bg-orange-50 text-orange-700">10-14: Moderate</div>
                <div className="px-3 py-2 rounded-lg bg-red-50 text-red-700">15-19: Mod. Severe</div>
                <div className="px-3 py-2 rounded-lg bg-red-100 text-red-800 col-span-2">20-27: Severe</div>
              </>
            ) : (
              <>
                <div className="px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700">0-4: Minimal</div>
                <div className="px-3 py-2 rounded-lg bg-yellow-50 text-yellow-700">5-9: Mild</div>
                <div className="px-3 py-2 rounded-lg bg-orange-50 text-orange-700">10-14: Moderate</div>
                <div className="px-3 py-2 rounded-lg bg-red-50 text-red-700 col-span-2">15-21: Severe</div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={() => setView('select')}
          className="px-5 py-2.5 rounded-full border-2 border-border-custom text-sm font-semibold hover:border-dark transition-all bg-transparent cursor-pointer">
          Back to Assessments
        </button>
        <button onClick={() => startTest(testType)}
          className="px-5 py-2.5 rounded-full bg-primary text-dark text-sm font-semibold hover:shadow-glow transition-all">
          Retake {testType}
        </button>
      </div>
    </div>
  );

  return null;
};

export default Screening;
