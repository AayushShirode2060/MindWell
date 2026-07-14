import { BookOpen, AlertTriangle, MessageCircleHeart, ShieldCheck } from 'lucide-react';

const TrainingTab = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Training & Resources</h2>
        <p className="text-sm text-text-muted">Guidelines to help you provide the best possible support.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Do's and Don'ts */}
        <div className="bg-white rounded-2xl p-6 border border-border-custom">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 mb-4">
            <MessageCircleHeart size={20} />
          </div>
          <h3 className="font-bold mb-3">Do's and Don'ts of Peer Support</h3>
          <div className="space-y-3 text-sm">
            <div>
              <strong className="text-emerald-600">✅ DO:</strong>
              <p className="text-text-muted">Listen actively, validate their feelings, and express empathy.</p>
            </div>
            <div>
              <strong className="text-emerald-600">✅ DO:</strong>
              <p className="text-text-muted">Ask open-ended questions to help them process.</p>
            </div>
            <div className="pt-2 border-t border-gray-100">
              <strong className="text-red-500">❌ DON'T:</strong>
              <p className="text-text-muted">Offer medical diagnoses or promise to fix their problems.</p>
            </div>
            <div>
              <strong className="text-red-500">❌ DON'T:</strong>
              <p className="text-text-muted">Share personal contact information.</p>
            </div>
          </div>
        </div>

        {/* Crisis Protocol */}
        <div className="bg-white rounded-2xl p-6 border border-border-custom">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600 mb-4">
            <AlertTriangle size={20} />
          </div>
          <h3 className="font-bold mb-3">Crisis Escalation Protocol</h3>
          <p className="text-sm text-text-muted mb-4">
            If a student indicates they are a danger to themselves or others, you MUST escalate the chat immediately.
          </p>
          <ul className="text-sm space-y-2 text-text-muted list-disc pl-4 marker:text-red-400">
            <li>Keywords: "suicide", "harm", "end it", "worthless"</li>
            <li>Click the red <strong>ESCALATE</strong> button in the chat.</li>
            <li>Do not leave the chat until the system confirms escalation.</li>
            <li>If the user disconnected, submit an Incident Summary immediately.</li>
          </ul>
        </div>

        {/* Boundaries */}
        <div className="bg-white rounded-2xl p-6 border border-border-custom">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 mb-4">
            <ShieldCheck size={20} />
          </div>
          <h3 className="font-bold mb-3">Setting Boundaries</h3>
          <p className="text-sm text-text-muted">
            You are a peer listener, not a therapist. It is okay to say: "I want to help, but this sounds like something our professional counsellors are better equipped to handle."
          </p>
        </div>
        
        {/* Guides */}
        <div className="bg-white rounded-2xl p-6 border border-border-custom">
           <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 mb-4">
            <BookOpen size={20} />
          </div>
          <h3 className="font-bold mb-3">Downloadable Manuals</h3>
          <div className="space-y-2">
            <button className="w-full text-left p-3 rounded-xl bg-surface hover:bg-gray-100 transition-colors text-sm font-semibold flex justify-between items-center">
              Active Listening 101 <span className="text-xs font-normal text-text-muted">PDF</span>
            </button>
            <button className="w-full text-left p-3 rounded-xl bg-surface hover:bg-gray-100 transition-colors text-sm font-semibold flex justify-between items-center">
              De-escalation Techniques <span className="text-xs font-normal text-text-muted">PDF</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TrainingTab;
