import { useState, useEffect } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { X, User, Phone, BookOpen, Hash, Loader2 } from 'lucide-react';

const ProfileModal = ({ onClose }) => {
  const { user, verifyOTP } = useAuth(); // get user from auth context
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    department: user?.department || '',
    enrollmentNo: user?.enrollmentNo || ''
  });
  
  // Update auth context state directly or let a page refresh do it?
  // We can just update sessionStorage and force a reload, or update the AuthContext if it has an update function.
  // Actually, AuthContext has no `updateUser` function. We can just reload window or manually set sessionStorage.

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.put('/auth/profile', formData);
      if (res.data.success) {
        // Update local session storage so the user's name updates immediately on next render
        sessionStorage.setItem('user', JSON.stringify(res.data.user));
        alert('Profile updated successfully!');
        window.location.reload(); // Quick way to sync auth state everywhere
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-8 text-center relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-colors"
          >
            <X size={18} />
          </button>
          
          <div className="w-20 h-20 bg-white rounded-full mx-auto shadow-lg flex items-center justify-center text-3xl font-bold text-teal-600 mb-3 border-4 border-white/30">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <h2 className="text-2xl font-black text-white">{user?.name}</h2>
          <p className="text-emerald-100 text-sm font-medium capitalize">{user?.role} Account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          <div className="space-y-4">
            
            <div className="relative">
              <label className="text-xs font-bold text-text-muted uppercase mb-1 block">Full Name</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all"
                />
              </div>
            </div>

            <div className="relative">
              <label className="text-xs font-bold text-text-muted uppercase mb-1 block">Phone Number</label>
              <div className="relative">
                <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all"
                />
              </div>
            </div>

            {user?.role === 'student' && (
              <>
                <div className="relative">
                  <label className="text-xs font-bold text-text-muted uppercase mb-1 block">Department</label>
                  <div className="relative">
                    <BookOpen size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all"
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="text-xs font-bold text-text-muted uppercase mb-1 block">Enrollment Number</label>
                  <div className="relative">
                    <Hash size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="enrollmentNo"
                      value={formData.enrollmentNo}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all"
                    />
                  </div>
                </div>
              </>
            )}

          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-dark text-white font-bold rounded-xl hover:bg-black transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : 'Save Changes'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default ProfileModal;
