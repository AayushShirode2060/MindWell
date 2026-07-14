import { useRef, useMemo, useState, useEffect, Suspense } from 'react';
import './LandingPage.css';
import { Link } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars } from '@react-three/drei';
import * as THREE from 'three';
import {
  Brain, Shield, MessageCircle, Users, Calendar, BookOpen,
  ArrowRight, Heart, Sparkles, ChevronDown, Activity, Lock
} from 'lucide-react';

/* ════════════════════════════════════════
   THREE.JS COMPONENTS
   ════════════════════════════════════════ */

// Floating neural particles that form a brain-like cluster
function NeuralParticles({ count = 300 }) {
  const mesh = useRef();
  const light = useRef();

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 2.5 + Math.random() * 1.5;
      temp.push({
        position: [
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta),
          r * Math.cos(phi),
        ],
        speed: 0.2 + Math.random() * 0.5,
        offset: Math.random() * Math.PI * 2,
      });
    }
    return temp;
  }, [count]);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    particles.forEach((p, i) => {
      pos[i * 3] = p.position[0];
      pos[i * 3 + 1] = p.position[1];
      pos[i * 3 + 2] = p.position[2];
    });
    return pos;
  }, [particles, count]);

  const colors = useMemo(() => {
    const col = new Float32Array(count * 3);
    const primary = new THREE.Color('#BAFF39');
    const secondary = new THREE.Color('#7aff39');
    const white = new THREE.Color('#ffffff');
    for (let i = 0; i < count; i++) {
      const r = Math.random();
      const color = r < 0.5 ? primary : r < 0.8 ? secondary : white;
      col[i * 3] = color.r;
      col[i * 3 + 1] = color.g;
      col[i * 3 + 2] = color.b;
    }
    return col;
  }, [count]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (mesh.current) {
      mesh.current.rotation.y = t * 0.05;
      mesh.current.rotation.x = Math.sin(t * 0.03) * 0.1;
      const posArray = mesh.current.geometry.attributes.position.array;
      particles.forEach((p, i) => {
        const wobble = Math.sin(t * p.speed + p.offset) * 0.15;
        posArray[i * 3] = p.position[0] + wobble;
        posArray[i * 3 + 1] = p.position[1] + Math.cos(t * p.speed + p.offset) * 0.15;
        posArray[i * 3 + 2] = p.position[2] + wobble * 0.5;
      });
      mesh.current.geometry.attributes.position.needsUpdate = true;
    }
    if (light.current) {
      light.current.position.x = Math.sin(t * 0.5) * 3;
      light.current.position.z = Math.cos(t * 0.5) * 3;
    }
  });

  return (
    <group>
      <pointLight ref={light} color="#BAFF39" intensity={2} distance={10} />
      <points ref={mesh}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={count}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={count}
            array={colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.04}
          vertexColors
          transparent
          opacity={0.8}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
}

// Glowing ring that pulses
function GlowRing() {
  const ref = useRef();
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (ref.current) {
      ref.current.scale.setScalar(1 + Math.sin(t * 1.5) * 0.05);
      ref.current.rotation.z = t * 0.1;
      ref.current.rotation.x = Math.sin(t * 0.2) * 0.3;
    }
  });
  return (
    <mesh ref={ref}>
      <torusGeometry args={[3.2, 0.015, 16, 100]} />
      <meshBasicMaterial color="#BAFF39" transparent opacity={0.3} />
    </mesh>
  );
}

function GlowRing2() {
  const ref = useRef();
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (ref.current) {
      ref.current.scale.setScalar(1 + Math.cos(t * 1.2) * 0.04);
      ref.current.rotation.z = -t * 0.08;
      ref.current.rotation.y = Math.cos(t * 0.3) * 0.4;
    }
  });
  return (
    <mesh ref={ref}>
      <torusGeometry args={[3.8, 0.01, 16, 100]} />
      <meshBasicMaterial color="#BAFF39" transparent opacity={0.15} />
    </mesh>
  );
}

// Neural connection lines
function NeuralConnections({ count = 40 }) {
  const linesRef = useRef();
  const lines = useMemo(() => {
    const result = [];
    for (let i = 0; i < count; i++) {
      const theta1 = Math.random() * Math.PI * 2;
      const phi1 = Math.acos(2 * Math.random() - 1);
      const r1 = 2.2 + Math.random() * 1;
      const theta2 = theta1 + (Math.random() - 0.5) * 1.5;
      const phi2 = phi1 + (Math.random() - 0.5) * 1;
      const r2 = 2.2 + Math.random() * 1;
      result.push({
        start: [r1 * Math.sin(phi1) * Math.cos(theta1), r1 * Math.sin(phi1) * Math.sin(theta1), r1 * Math.cos(phi1)],
        end: [r2 * Math.sin(phi2) * Math.cos(theta2), r2 * Math.sin(phi2) * Math.sin(theta2), r2 * Math.cos(phi2)],
        speed: 0.3 + Math.random() * 0.3,
        offset: Math.random() * Math.PI * 2,
      });
    }
    return result;
  }, [count]);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 6);
    lines.forEach((l, i) => {
      arr[i * 6] = l.start[0]; arr[i * 6 + 1] = l.start[1]; arr[i * 6 + 2] = l.start[2];
      arr[i * 6 + 3] = l.end[0]; arr[i * 6 + 4] = l.end[1]; arr[i * 6 + 5] = l.end[2];
    });
    return arr;
  }, [lines, count]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (linesRef.current) {
      linesRef.current.rotation.y = t * 0.05;
    }
  });

  return (
    <lineSegments ref={linesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count * 2} array={positions} itemSize={3} />
      </bufferGeometry>
      <lineBasicMaterial color="#BAFF39" transparent opacity={0.08} />
    </lineSegments>
  );
}

// The 3D scene
function Scene() {
  return (
    <>
      <ambientLight intensity={0.1} />
      <pointLight position={[5, 5, 5]} color="#BAFF39" intensity={0.5} />
      <Float speed={0.8} rotationIntensity={0.2} floatIntensity={0.3}>
        <NeuralParticles count={400} />
      </Float>
      <GlowRing />
      <GlowRing2 />
      <NeuralConnections count={50} />
      <Stars radius={50} depth={100} count={1500} factor={3} saturation={0} fade speed={1} />
    </>
  );
}

/* ════════════════════════════════════════
   SCROLL ANIMATION HOOK
   ════════════════════════════════════════ */
function useScrollAnimation() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return scrollY;
}

/* ════════════════════════════════════════
   ANIMATED COUNTER
   ════════════════════════════════════════ */
function AnimatedCounter({ end, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setVisible(true);
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [visible, end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

/* ════════════════════════════════════════
   MAIN LANDING PAGE
   ════════════════════════════════════════ */
const LandingPage = () => {
  const scrollY = useScrollAnimation();
  const [menuOpen, setMenuOpen] = useState(false);

  const features = [
    { icon: Brain, title: 'AI-Powered Support', desc: 'Talk to our empathetic AI chatbot anytime, trained to understand student mental health challenges.', color: '#BAFF39' },
    { icon: Calendar, title: 'Easy Appointments', desc: 'Book confidential sessions with professional counsellors in just a few taps.', color: '#74b9ff' },
    { icon: Activity, title: 'Mood Tracking', desc: 'Track your emotional patterns with smart analytics and personalized insights.', color: '#fdcb6e' },
    { icon: Shield, title: 'Self-Assessment', desc: 'Evidence-based screening tools (PHQ-9, GAD-7) with AI-driven crisis detection.', color: '#e17055' },
    { icon: BookOpen, title: 'Resource Hub', desc: 'Articles, quick guides, videos, and self-help toolkits curated by experts.', color: '#a29bfe' },
    { icon: Users, title: 'Peer Community', desc: 'Anonymous forum for sharing experiences and supporting each other.', color: '#00cec9' },
  ];

  const stats = [
    { value: 500, suffix: '+', label: 'Students Helped' },
    { value: 50, suffix: '+', label: 'Counsellors' },
    { value: 98, suffix: '%', label: 'Confidential' },
    { value: 24, suffix: '/7', label: 'AI Support' },
  ];

  return (
    <div className="landing-page">
      {/* ─── NAVBAR ─── */}
      <nav className="landing-nav" style={{ backdropFilter: scrollY > 50 ? 'blur(20px)' : 'none', background: scrollY > 50 ? 'rgba(10,10,10,0.85)' : 'transparent' }}>
        <div className="landing-nav-inner">
          <div className="landing-logo">
            <Brain size={26} color="#BAFF39" />
            <span>mindwell</span>
          </div>
          <div className={`landing-nav-links ${menuOpen ? 'open' : ''}`}>
            <a href="#features">Features</a>
            <a href="#stats">Impact</a>
            <a href="#how">How It Works</a>
          </div>
          <div className="landing-nav-actions">
            <Link to="/login" className="landing-btn-ghost">Sign In</Link>
            <Link to="/register" className="landing-btn-primary">Get Started <ArrowRight size={16} /></Link>
          </div>
          <button className="landing-menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="landing-hero">
        <div className="landing-canvas-wrap">
          <Suspense fallback={null}>
            <Canvas
              camera={{ position: [0, 0, 7], fov: 60 }}
              style={{ background: 'transparent' }}
              dpr={[1, 1.5]}
            >
              <Scene />
            </Canvas>
          </Suspense>
        </div>

        <div className="landing-hero-content" style={{ transform: `translateY(${scrollY * 0.3}px)`, opacity: 1 - scrollY / 600 }}>
          <div className="landing-hero-badge">
            <Sparkles size={14} /> the future of student wellbeing
          </div>
          <h1 className="landing-hero-title">
            your mind<br />
            <span className="landing-gradient-text">matters</span>.
          </h1>
          <p className="landing-hero-sub">
            A safe, confidential, AI-powered platform for students to access mental health support — 
            from screening to counselling to community.
          </p>
          <div className="landing-hero-actions">
            <Link to="/register" className="landing-btn-big">
              Start Your Journey <ArrowRight size={20} />
            </Link>
            <a href="#features" className="landing-btn-outline">
              Learn More <ChevronDown size={18} />
            </a>
          </div>
          <div className="landing-hero-trust">
            <Lock size={12} /> 100% confidential · Free · Stigma-free
          </div>
        </div>

        <div className="landing-scroll-indicator">
          <ChevronDown size={20} />
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="landing-features" id="features">
        <div className="landing-section-header">
          <span className="landing-tag">✨ Features</span>
          <h2>Everything you need for<br /><span className="landing-gradient-text">mental wellness</span></h2>
          <p>Comprehensive tools designed by mental health professionals for students.</p>
        </div>
        <div className="landing-features-grid">
          {features.map((f, i) => (
            <div key={i} className="landing-feature-card" style={{ '--card-accent': f.color }}>
              <div className="landing-feature-icon" style={{ background: `${f.color}15`, color: f.color }}>
                <f.icon size={24} />
              </div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
              <div className="landing-feature-glow" style={{ background: f.color }} />
            </div>
          ))}
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className="landing-stats" id="stats">
        <div className="landing-stats-grid">
          {stats.map((s, i) => (
            <div key={i} className="landing-stat-card">
              <div className="landing-stat-value">
                <AnimatedCounter end={s.value} suffix={s.suffix} />
              </div>
              <div className="landing-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="landing-how" id="how">
        <div className="landing-section-header">
          <span className="landing-tag">🚀 How It Works</span>
          <h2>Get started in<br /><span className="landing-gradient-text">3 simple steps</span></h2>
        </div>
        <div className="landing-steps">
          {[
            { num: '01', title: 'Create Account', desc: 'Sign up with your college email. It takes less than a minute. Your data is encrypted and confidential.' },
            { num: '02', title: 'Explore & Assess', desc: 'Take self-assessments, track your mood, chat with our AI, or browse expert-curated resources.' },
            { num: '03', title: 'Get Support', desc: 'Book sessions with professional counsellors, join peer forums, or access crisis resources instantly.' },
          ].map((step, i) => (
            <div key={i} className="landing-step-card">
              <div className="landing-step-num">{step.num}</div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
              {i < 2 && <div className="landing-step-connector" />}
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="landing-cta">
        <div className="landing-cta-inner">
          <Heart size={40} className="landing-cta-icon" />
          <h2>Ready to take the first step?</h2>
          <p>Join thousands of students who've chosen to prioritize their mental health. It's free, private, and stigma-free.</p>
          <Link to="/register" className="landing-btn-big">
            Create Free Account <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-footer-brand">
            <Brain size={22} color="#BAFF39" />
            <span>mindwell</span>
            <p>Digital Mental Health & Psychological Support System</p>
          </div>
          <div className="landing-footer-links">
            <div>
              <h4>Platform</h4>
              <a href="#features">Features</a>
              <a href="#how">How It Works</a>
              <a href="#stats">Impact</a>
            </div>
            <div>
              <h4>Account</h4>
              <Link to="/login">Sign In</Link>
              <Link to="/register">Register</Link>
            </div>
          </div>
        </div>
        <div className="landing-footer-bottom">
          <p>© 2026 MindWell. Built with ❤️ for student mental health.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
