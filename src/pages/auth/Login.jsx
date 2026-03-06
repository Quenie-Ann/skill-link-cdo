import React, { useState, useEffect } from 'react';
import { localAuth } from '../../services/auth'; 
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, Mail, Lock, AlertCircle } from 'lucide-react';
import workspaceImg from '../../assets/background.jpg';

const Login = ({ onLoginSuccess }) => { // Added prop to update App.jsx state
  const navigate = useNavigate();

  // ── Form & UI State ──
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // ── Dark Mode Toggle Logic ──
  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDark]);

  function handleInput(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (loginError) setLoginError("");
  }

  function validate() {
    const e = {};
    if (!formData.email.trim()) e.email = "Email is required.";
    if (!formData.password.trim()) e.password = "Password is required.";
    return e;
  }

  // ── UPDATED Submission (Using localAuth.signIn) ──
  async function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    
    try {
      const { user } = localAuth.signIn(formData.email.trim(), formData.password);

      setTimeout(() => { 
        setIsLoading(false);
        if (onLoginSuccess) onLoginSuccess(user);
        navigate(`/${user.role}/dashboard`);
      }, 800);

    } catch (err) {
      // Catch the "throw new Error" from service
      setIsLoading(false);
      setLoginError(err.message);
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-skill-dark dark:bg-slate-950 p-4 transition-colors duration-500">
      <div className="flex flex-col md:flex-row w-full max-w-5xl bg-white dark:bg-slate-900 rounded-lg overflow-hidden shadow-2xl">
        
        {/* Left Side */}
        <div className="relative w-full md:w-1/2 h-48 md:h-auto">
          <img src={workspaceImg} className="absolute inset-0 w-full h-full object-cover" alt="Branding" />
          <div className="absolute inset-0 bg-skill-dark/40 backdrop-blur-[2px]" />
          <div className="absolute bottom-20 left-10 text-white hidden md:block">
            <h1 className="text-5xl font-bold mb-2">Skill-Link CDO</h1>
            <p className="text-xl opacity-90">Connecting Skills to Opportunities.</p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-1/2 p-8 md:p-14 relative">
          <button onClick={() => setIsDark(!isDark)} className="absolute top-6 right-8 p-2 rounded-full bg-gray-100 dark:bg-slate-800">
            {isDark ? <Sun size={20} className="text-yellow-400"/> : <Moon size={20} />}
          </button>

          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-skill-dark dark:text-skill-primary">Welcome Back</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Sign in to your demo account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  name="email" type="email" value={formData.email} onChange={handleInput}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-slate-800 border-2 rounded-lg outline-none dark:text-white border-transparent focus:border-skill-primary"
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  name="password" type="password" value={formData.password} onChange={handleInput}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-slate-800 border-2 rounded-lg outline-none dark:text-white border-transparent focus:border-skill-primary"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {loginError && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
                <AlertCircle size={16} /> {loginError}
              </div>
            )}

            <button type="submit" disabled={isLoading}
              className="w-full py-4 bg-skill-primary hover:bg-emerald-600 text-white font-bold rounded-lg shadow-lg transition-all"
            >
              {isLoading ? "Authenticating..." : "Sign In"}
            </button>
          </form>
          
        </div>
      </div>
    </div>
  );
};

export default Login;
