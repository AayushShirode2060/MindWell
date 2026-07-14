import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { collegeEndpoints, adminEndpoints } from '../api/endpoints';
import { UserPlus, Mail, Lock, User, Phone, Building, Hash, ArrowRight, RotateCw, Upload, Shield } from 'lucide-react';

const RegisterPage = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'student',
    phone: '', department: '', enrollmentNo: '', specialization: '',
    college: '', collegeName: '', proofUrl: ''
  });
  const [colleges, setColleges] = useState([]);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [proofPreview, setProofPreview] = useState('');

  const { register, verifyOTP, resendOTP } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const res = await API.get(collegeEndpoints.GET_COLLEGES_API);
        setColleges(res.data.colleges);
      } catch (err) { console.error(err); }
    };
    fetchColleges();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProofUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('proof', file);
      const res = await API.post(adminEndpoints.UPLOAD_PROOF_API, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({ ...prev, proofUrl: res.data.url }));
      setProofPreview(URL.createObjectURL(file));
    } catch (err) {
      setError('Failed to upload proof. Please try again.');
    }
    setUploading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);

    // Validate college for student
    if (formData.role === 'student' && !formData.college) {
      setError('Please select your college');
      setLoading(false);
      return;
    }
    // Validate college name for admin
    if (formData.role === 'admin' && !formData.collegeName.trim()) {
      setError('Please enter your college name');
      setLoading(false);
      return;
    }
    // Validate proof for admin
    if (formData.role === 'admin' && !formData.proofUrl) {
      setError('Please upload your college ID proof');
      setLoading(false);
      return;
    }

    try {
      const data = await register(formData);
      if (data.success) { setSuccess(data.message); setStep(2); }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const data = await verifyOTP(formData.email, otp);
      if (data.success) {
        if (formData.role === 'admin') {
          setSuccess('Registration complete! Your account is pending superadmin verification.');
          setTimeout(() => navigate('/login'), 3000);
        } else {
          navigate(`/${data.user?.role || 'student'}/dashboard`);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed');
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    try {
      const data = await resendOTP(formData.email);
      setSuccess(data.message); setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
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
          <span className="brand-tag">join the community</span>
          <h1>
            start your<br />
            <span>journey</span>.
          </h1>
          <p>
            Create your account and take the first step towards better 
            mental health. It's confidential, free, and stigma-free.
          </p>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="auth-right">
        <div className="auth-card" style={{ maxWidth: step === 1 ? '480px' : '420px' }}>
          <div className="auth-header">
            <div className="logo-icon">🧠</div>
            <h2>{step === 1 ? 'create account' : 'verify email'}</h2>
            <p>{step === 1 ? 'join the mindwell community' : 'enter the OTP sent to your email'}</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          {step === 1 ? (
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label className="flex items-center gap-1"><User size={12} /> Full Name</label>
                <input name="name" placeholder="your full name" value={formData.name} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label className="flex items-center gap-1"><Mail size={12} /> Email</label>
                <input name="email" type="email"
                  placeholder={formData.role === 'admin' ? 'your.name@college.edu' : 'you@university.edu'}
                  value={formData.email} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label className="flex items-center gap-1"><Lock size={12} /> Password</label>
                <input name="password" type="password" placeholder="min 6 characters" value={formData.password} onChange={handleChange} required minLength={6} />
              </div>

              <div className="form-group">
                <label>Role</label>
                <select name="role" value={formData.role} onChange={handleChange}>
                  <option value="student">Student</option>
                  <option value="counsellor">Counsellor</option>
                  <option value="volunteer">Peer Volunteer</option>
                  <option value="admin">College Admin</option>
                </select>
              </div>

              {/* College — dropdown for student, text input for admin */}
              {formData.role === 'student' && (
                <div className="form-group">
                  <label className="flex items-center gap-1"><Building size={12} /> College</label>
                  <select name="college" value={formData.college} onChange={handleChange} required>
                    <option value="">Select your college</option>
                    {colleges.map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}
              {formData.role === 'admin' && (
                <div className="form-group">
                  <label className="flex items-center gap-1"><Building size={12} /> College Name</label>
                  <input name="collegeName" placeholder="e.g. IIT Delhi, BITS Pilani..."
                    value={formData.collegeName} onChange={handleChange} required />
                </div>
              )}

              {formData.role === 'admin' ? (
                <div className="form-group">
                  <label className="flex items-center gap-1"><Phone size={12} /> Phone</label>
                  <input name="phone" placeholder="phone number" value={formData.phone} onChange={handleChange} />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div className="form-group">
                    <label className="flex items-center gap-1"><Phone size={12} /> Phone</label>
                    <input name="phone" placeholder="phone number" value={formData.phone} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="flex items-center gap-1"><Building size={12} /> Department</label>
                    <input name="department" placeholder="e.g. CS" value={formData.department} onChange={handleChange} />
                  </div>
                </div>
              )}

              {formData.role === 'student' && (
                <div className="form-group">
                  <label className="flex items-center gap-1"><Hash size={12} /> Enrollment No</label>
                  <input name="enrollmentNo" placeholder="e.g. CS2024001" value={formData.enrollmentNo} onChange={handleChange} />
                </div>
              )}

              {formData.role === 'counsellor' && (
                <div className="form-group">
                  <label>Specialization</label>
                  <input name="specialization" placeholder="e.g. Anxiety & Depression" value={formData.specialization} onChange={handleChange} />
                </div>
              )}

              {/* Admin — Proof Upload */}
              {formData.role === 'admin' && (
                <div className="form-group">
                  <label className="flex items-center gap-1"><Shield size={12} /> College ID Proof</label>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '4px 0 8px' }}>
                    Upload your college ID card or official letter. This will be verified by the superadmin.
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <label style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      padding: '8px 16px', borderRadius: '10px', cursor: 'pointer',
                      fontSize: '12px', fontWeight: 600,
                      background: uploading ? 'var(--surface)' : 'var(--dark)',
                      color: uploading ? 'var(--text-muted)' : '#fff',
                      border: 'none'
                    }}>
                      <Upload size={14} />
                      {uploading ? 'Uploading...' : formData.proofUrl ? '✓ Uploaded' : 'Choose File'}
                      <input type="file" accept="image/*,.pdf" onChange={handleProofUpload}
                        style={{ display: 'none' }} disabled={uploading} />
                    </label>
                    {proofPreview && (
                      <img src={proofPreview} alt="proof" style={{ height: '40px', borderRadius: '8px', border: '1px solid var(--border)' }} />
                    )}
                  </div>
                </div>
              )}

              {formData.role === 'admin' && (
                <div style={{
                  background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '10px',
                  padding: '10px 14px', fontSize: '11px', color: '#92400e', marginBottom: '12px'
                }}>
                  ⚠️ Admin accounts require superadmin verification. You'll be able to log in after your proof is verified.
                </div>
              )}

              <button type="submit" className="btn btn-primary w-full justify-center mt-3" disabled={loading}>
                {loading ? <div className="spinner" /> : <>Create Account <ArrowRight size={18} /></>}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP}>
              <div className="form-group">
                <label>Enter 6-digit OTP</label>
                <input
                  type="text"
                  placeholder="• • • • • •"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  maxLength={6}
                  className="text-center text-2xl font-bold tracking-[10px]"
                />
              </div>

              <button type="submit" className="btn btn-primary w-full justify-center" disabled={loading}>
                {loading ? <div className="spinner" /> : <>Verify & Continue <ArrowRight size={18} /></>}
              </button>

              <p className="text-center mt-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                didn't receive OTP?{' '}
                <button type="button" onClick={handleResend}
                  className="bg-transparent font-bold text-sm inline-flex items-center gap-1" style={{ color: 'var(--text)' }}>
                  <RotateCw size={13} /> resend
                </button>
              </p>
            </form>
          )}

          <div className="auth-footer">
            already have an account?{' '}
            <Link to="/login">sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
