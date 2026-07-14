import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios';
import { authEndpoints } from '../api/endpoints';

const { REGISTER_API, LOGIN_API, VERIFY_OTP_API, RESEND_OTP_API, GET_PROFILE_API } = authEndpoints;

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(sessionStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await API.get(GET_PROFILE_API);
          setUser(res.data.user);
        } catch (err) {
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    loadUser();
  }, [token]);

  const register = async (formData) => {
    const res = await API.post(REGISTER_API, formData);
    console.log("this is register",res)
    return res.data;
  };

  const verifyOTP = async (email, otp) => {
    const res = await API.post(VERIFY_OTP_API, { email, otp });
     console.log("this is verify otp",res)
    if (res.data.token) {
      sessionStorage.setItem('token', res.data.token);
      sessionStorage.setItem('user', JSON.stringify(res.data.user));
      setToken(res.data.token);
      setUser(res.data.user);
    }
    return res.data;
  };

  const resendOTP = async (email) => {
    const res = await API.post(RESEND_OTP_API, { email });
     console.log("this is resend otp",res)
    return res.data;
  };

  const login = async (email, password) => {
    const res = await API.post(LOGIN_API, { email, password });
     console.log("this islogin",res)
     console.log(JSON.stringify(res.data.user))
    if (res.data.token) {
      sessionStorage.setItem('token', res.data.token);
      sessionStorage.setItem('user', JSON.stringify(res.data.user));
      setToken(res.data.token);
      setUser(res.data.user);
    }
    return res.data;
  };

  const logout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      register, verifyOTP, resendOTP, login, logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

