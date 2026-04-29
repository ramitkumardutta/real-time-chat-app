import React, { useState } from 'react'
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AuthImagePattern from '../components/AuthImagePattern';
import { axiosInstanace } from '../lib/axios';

const ForgetPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  const handleVerify = async (e) => {
    e.preventDefault();
    setMessage(null);
    if (!email) return setMessage({ type: 'error', text: 'Please enter your email' });
    setIsVerifying(true);
    try {
      await axiosInstanace.post('/auth/verify-email', { email });
      setIsVerified(true);
      setMessage({ type: 'success', text: 'Email verified. Please enter a new password.' });
    } catch (err) {
      const text = err?.response?.data?.message || 'Unable to verify email';
      setMessage({ type: 'error', text });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage(null);
    if (!password || password.length < 6) return setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
    setIsResetting(true);
    try {
      await axiosInstanace.post('/auth/reset-password', { email, password });
      window.alert('Password changed successfully');
      navigate('/login');
    } catch (err) {
      const text = err?.response?.data?.message || 'Unable to change password';
      setMessage({ type: 'error', text });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div>
      <div className="h-screen grid lg:grid-cols-2">
        <div className="flex flex-col justify-center items-center p-6 sm:p-12">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center mb-8">
              <div className="flex flex-col items-center gap-2 group">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <MessageSquare className="w-6 h-6 text-primary" />
                </div>
                <h1 className="text-2xl font-bold mt-2">Forgot Password</h1>
                <p className="text-base-content/60">Enter the email associated with your account</p>
              </div>
            </div>

            {message && (
              <div className={`p-3 rounded ${message.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                {message.text}
              </div>
            )}

            {!isVerified ? (
              <form onSubmit={handleVerify} className="space-y-6">
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">Email</span></label>
                  <div className="relative">
                    <div className="absolute z-10 inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-base-content/40" />
                    </div>
                    <input 
                    type="email" 
                    className={`input input-bordered w-full pl-10`} 
                    placeholder="you@example.com" 
                    value={email} 
                    onChange={(e) => 
                        setEmail(e.target.value)
                    } 
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary w-full" disabled={isVerifying}>
                  {isVerifying ? (<><Loader2 className="h-5 w-5 animate-spin" /> Verifying...</>) : 'Verify Email'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleReset} className="space-y-6">
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">New Password</span></label>
                  <div className="relative">
                    <div className="absolute z-10 inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-base-content/40" />
                    </div>
                    <input 
                        type={showPassword ? 'text' : 'password'} 
                        className={`input input-bordered w-full pl-10`} 
                        placeholder="••••••••" 
                        value={password} 
                        onChange={(e) => 
                            setPassword(e.target.value)
                        } 
                    />
                    <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? (<EyeOff className="h-5 w-5 text-base-content/40" />) : (<Eye className="h-5 w-5 text-base-content/40" />)}
                    </button>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary w-full" disabled={isResetting}>
                  {isResetting ? (<><Loader2 className="h-5 w-5 animate-spin" /> Saving...</>) : 'Change Password'}
                </button>
              </form>
            )}

            <div className="text-center">
              <p className="text-base-content/60">
                Remembered your password?{' '}
                <Link to="/login" className="link link-primary">Sign in</Link>
              </p>
            </div>
          </div>
        </div>

        <AuthImagePattern title={"Reset your password"} subtitle={"Verify your email and set a new password to regain access."} />
      </div>
    </div>
  )
}

export default ForgetPasswordPage
