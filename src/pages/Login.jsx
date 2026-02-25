import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { useNavigate, Link } from 'react-router-dom'; 
import { Mail, Lock, Github } from 'lucide-react';
import logo from '../assets/logo.png';
import workspaceImg from '../assets/background.jpg';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      alert(error.message);
    } else {
      navigate('/dashboard');
    }
  };

  //  GOOGLE LOGIN FUNCTION
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      alert(error.message);
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-sans text-gray-900">
      {/* LEFT SIDE: LOGIN FORM */}
      <div className="w-full lg:w-2/5 flex items-center justify-center p-10 md:p-20">
        <div className="w-full max-w-lg">
          <div className="mb-8">
             <img src={logo} alt="Skill-Link Logo" className="h-12 w-auto mb-4" />
             <p className="text-gray-500 mt-2">Connecting Skills to Opportunities</p>
             <h2 className="text-3xl font-bold text-skill-dark">Sign in to your account</h2>
          </div>

          <form onSubmit={handleLogin} className="space-y-8">
            <div>
              <label className="block text-base font-bold text-gray-700 mb-3">Email address</label>
              <input 
                type="email" 
                className="w-full p-5 text-lg bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-4 focus:ring-skill-primary/20 focus:border-skill-primary focus:bg-white outline-none transition-all"
                placeholder="name@example.com"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-base font-bold text-gray-700">Password</label>
              <input 
                type="password" 
                className="w-full p-5 text-lg bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-4 focus:ring-skill-primary/20 focus:border-skill-primary focus:bg-white outline-none transition-all"
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              className="w-full py-5 bg-skill-dark text-white text-xl font-black rounded-2xl hover:bg-skill-primary shadow-xl shadow-green-900/20 transition-all active:scale-95"
            >
              Sign In
            </button>
          </form>

          <div className="mt-8">
            <div className="relative flex items-center justify-center">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="flex-shrink mx-4 text-gray-400 text-sm">Or continue with</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            {/*  GOOGLE BUTTON FIXED */}
            <div className="mt-8">
              <button 
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                <img 
                  src="https://www.svgrepo.com/show/355037/google.svg" 
                  className="h-5 w-5 mr-2" 
                  alt="Google" 
                />
                <span className="text-sm font-medium">Continue with Google</span>
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* RIGHT SIDE IMAGE */}
      <div className="hidden lg:block lg:w-7/12 relative">
        <img 
          src={workspaceImg}
          alt="Workspace" 
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-skill-dark opacity-20"></div>
      </div>
    </div>
  );
};

export default Login;