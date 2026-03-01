import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, Mail, Lock, AlertCircle } from 'lucide-react';
import { localAuth } from '../../services/auth';
import workspaceImg from '../../assets/background.jpg';

const Login = ({ onLoginSuccess }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors]     = useState({});
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading]   = useState(false);
  const [isDark, setIsDark]         = useState(false);

  // Dark-mode toggle
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  function handleInput(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name])  setErrors((prev) => ({ ...prev, [name]: '' }));
    if (loginError)    setLoginError('');
  }

  function validate() {
    const e = {};
    if (!formData.email.trim()) {
      e.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      e.email = 'Enter a valid email address.';
    }
    if (!formData.password.trim()) {
      e.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      e.password = 'Password must be at least 6 characters.';
    }
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setIsLoading(true);
    // Simulate a tiny async delay for realism
    await new Promise((r) => setTimeout(r, 400));
    try {
      const { user } = localAuth.signIn(formData.email.trim(), formData.password);
      onLoginSuccess(user); 
      navigate(`/${user.role}/dashboard`);
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-skill-dark dark:bg-slate-950 p-4 md:p-6 transition-colors duration-500">
      
      {/* Main Card */}
      <div className="flex flex-col md:flex-row w-full max-w-5xl bg-white dark:bg-slate-900 rounded-5xl overflow-hidden shadow-2xl transition-all">
        
        {/* Left – Visual */}
        <div className="relative w-full md:w-1/2 h-48 md:h-auto">
          <img
            src={workspaceImg}
            className="absolute inset-0 w-full h-full object-cover"
            alt="Branding"
          />
          <div className="absolute inset-0 bg-skill-dark/40 backdrop-blur-[2px]" />
          <div className="absolute bottom-20 left-10 text-white hidden md:block">
            <h1 className="text-5xl font-bold mb-2">Skill-Link CDO</h1>
            <p className="text-xl opacity-90">Connecting Skills to Opportunities.</p>
          </div>
        </div>

        {/* Right – Form */}
        <div className="w-full md:w-1/2 p-8 md:p-14 relative">

          {/* Dark toggle */}
          <button
            onClick={() => setIsDark(!isDark)}
            className="absolute top-6 right-8 p-2 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-yellow-400"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-skill-dark dark:text-skill-primary">Welcome Back</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Sign in to manage your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className={`absolute left-4 top-1/2 -translate-y-1/2 ${errors.email ? 'text-red-500' : 'text-gray-400'}`}
                  size={18}
                />
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInput}
                  className={`w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-slate-800 border-2 rounded-2xl outline-none transition-all dark:text-white
                    ${errors.email
                      ? 'border-red-500 focus:ring-red-200'
                      : 'border-transparent focus:ring-skill-primary/20 focus:border-skill-primary'}`}
                  placeholder="name@example.com"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock
                  className={`absolute left-4 top-1/2 -translate-y-1/2 ${errors.password ? 'text-red-500' : 'text-gray-400'}`}
                  size={18}
                />
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInput}
                  className={`w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-slate-800 border-2 rounded-2xl outline-none transition-all dark:text-white
                    ${errors.password
                      ? 'border-red-500 focus:ring-red-200'
                      : 'border-transparent focus:ring-skill-primary/20 focus:border-skill-primary'}`}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.password}
                </p>
              )}
            </div>

            {/* General error */}
            {loginError && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                <AlertCircle size={16} /> {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-skill-primary hover:bg-emerald-600 disabled:opacity-70 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/30 transition-all active:scale-[0.98]"
            >
              {isLoading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;