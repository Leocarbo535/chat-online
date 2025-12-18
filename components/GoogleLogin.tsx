import React, { useState } from 'react';
import { User } from '../types';
import { chatService } from '../services/chatService';

interface GoogleLoginProps {
  onLogin: (user: User) => void;
}

export const GoogleLogin: React.FC<GoogleLoginProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegistering) {
        const result = await chatService.register(name, username, email, password);
        if (result.success && result.user) {
          onLogin(result.user);
        } else {
          setError(result.error || 'Registration failed');
        }
      } else {
        // Login Logic
        const user = await chatService.login(email, password); // Email field acts as identifier (email or username)
        if (user) {
          onLogin(user);
        } else {
          setError('Invalid email/username or password');
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#d1d7db] flex items-center justify-center p-4">
      {/* Decorative Green Bar */}
      <div className="absolute top-0 w-full h-[220px] bg-[#00a884] z-0"></div>

      <div className="bg-white rounded-lg shadow-xl w-full max-w-[900px] flex overflow-hidden z-10 min-h-[500px]">
        
        {/* Left Side (Info) - Hidden on mobile */}
        <div className="hidden md:flex flex-col justify-center p-12 bg-white w-5/12 border-r border-gray-100">
             <div className="mb-8">
                 <h1 className="text-3xl font-light text-[#41525d] mb-4">WhatsChat Web</h1>
                 <p className="text-[#667781] text-lg">Connect with friends simply and securely.</p>
             </div>
             <div className="text-sm text-[#8696a0]">
                <p className="mb-2">1. Register a unique username.</p>
                <p className="mb-2">2. Share your ID with friends.</p>
                <p>3. Start chatting instantly.</p>
             </div>
        </div>

        {/* Right Side (Form) */}
        <div className="w-full md:w-7/12 p-8 md:p-12 flex flex-col justify-center">
            <h2 className="text-2xl text-[#41525d] font-light mb-8 text-center md:text-left">
                {isRegistering ? 'Create Account' : 'Login'}
            </h2>

            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm border border-red-200">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                
                {isRegistering && (
                    <>
                        <div>
                            <label className="block text-xs text-[#00a884] font-medium mb-1">DISPLAY NAME</label>
                            <input 
                                required
                                type="text" 
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full border-b border-gray-300 py-2 focus:border-[#00a884] focus:outline-none transition-colors"
                                placeholder="John Doe"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-[#00a884] font-medium mb-1">USERNAME (Unique)</label>
                            <input 
                                required
                                type="text" 
                                value={username}
                                onChange={e => setUsername(e.target.value.replace(/\s/g, ''))}
                                className="w-full border-b border-gray-300 py-2 focus:border-[#00a884] focus:outline-none transition-colors"
                                placeholder="john_doe_99"
                            />
                        </div>
                    </>
                )}

                <div>
                    <label className="block text-xs text-[#00a884] font-medium mb-1">
                        {isRegistering ? 'EMAIL' : 'EMAIL OR USERNAME'}
                    </label>
                    <input 
                        required
                        type={isRegistering ? "email" : "text"}
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full border-b border-gray-300 py-2 focus:border-[#00a884] focus:outline-none transition-colors"
                        placeholder={isRegistering ? "name@example.com" : "Enter email or username"}
                    />
                </div>

                <div>
                    <label className="block text-xs text-[#00a884] font-medium mb-1">PASSWORD</label>
                    <input 
                        required
                        type="password" 
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full border-b border-gray-300 py-2 focus:border-[#00a884] focus:outline-none transition-colors"
                        placeholder="••••••••"
                    />
                </div>

                <div className="pt-4">
                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#00a884] text-white py-3 rounded hover:bg-[#008f6f] transition-all font-medium shadow-sm"
                    >
                        {loading ? 'Processing...' : (isRegistering ? 'Register' : 'Login')}
                    </button>
                </div>
            </form>

            <div className="mt-6 text-center text-sm text-[#54656f]">
                {isRegistering ? 'Already have an account? ' : 'Need an account? '}
                <button 
                    onClick={() => {
                        setIsRegistering(!isRegistering);
                        setError('');
                    }}
                    className="text-[#00a884] font-medium hover:underline"
                >
                    {isRegistering ? 'Log in' : 'Sign up'}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};