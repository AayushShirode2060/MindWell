import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      if (data.success) {
        // Block unapproved admins
        if (data.user.role === 'admin' && !data.user.isApproved) {
          setError('Your admin account is pending superadmin verification. Please wait for approval.');
          setLoading(false);
          return;
        }
        // Superadmin uses admin route
        const role = data.user.role === 'superadmin' ? 'admin' : data.user.role;
        navigate(`/${role}/dashboard`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="grain-overlay" />

      {/* Left Panel — Branding */}
      <div className="auth-left">
        <div className="floating-elements">
          <div className="float-circle" />
          <div className="float-circle" />
          <div className="float-circle" />
          <div className="float-circle" />
          <div className="float-line" />
          <div className="float-line" />
        </div>
        <div className="auth-brand">
          <span className="brand-tag">mental health support</span>
          <h1>your mind<br /><span>matters</span>.</h1>
          <p>A safe, stigma-free platform for students to access mental health resources, connect with counsellors, and build resilience.</p>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-header">
            <div className="logo-icon">🧠</div>
            <h2>welcome back</h2>
            <p>sign in to your mindwell account</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="flex items-center gap-1"><Mail size={12} /> Email</label>
              <input type="email" placeholder="you@university.edu" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="flex items-center gap-1"><Lock size={12} /> Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="enter your password"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  required className="w-full pr-12"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent text-gray-400 hover:text-gray-700 p-1">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full justify-center mt-3" disabled={loading}>
              {loading ? <div className="spinner" /> : <>Sign In <ArrowRight size={18} /></>}
            </button>
          </form>

          <div className="auth-footer">
            don't have an account? <Link to="/register">create one</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
