import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Shield, KeyRound, CheckCircle2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { forgotPassword, resetPassword, resendOTP } from '@/services/authService';
import { OTPInput } from '@/components/OTPInput';
import couponImage from '@/assets/coupon image.webp';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'email' | 'otp' | 'newPassword' | 'success'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOTP] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendingOTP, setResendingOTP] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  // Timer effect for OTP resend
  useEffect(() => {
    if (otpTimer > 0) {
      const interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [otpTimer]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await forgotPassword(email);
      setStep('otp');
      setOtpTimer(60);
      toast({
        title: 'OTP Sent',
        description: 'Please check your email for the verification code.',
      });
    } catch (error) {
      toast({
        title: 'Failed to Send OTP',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = (otpValue: string) => {
    setOTP(otpValue);
    setStep('newPassword');
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      toast({
        title: 'Password Too Short',
        description: 'Password must be at least 6 characters.',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Passwords Do Not Match',
        description: 'Please make sure both passwords match.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      await resetPassword(email, otp, newPassword);
      setStep('success');
      toast({
        title: 'Password Reset Successful',
        description: 'You can now login with your new password.',
      });
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      toast({
        title: 'Failed to Reset Password',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (otpTimer > 0) return;

    setResendingOTP(true);
    try {
      await resendOTP(email, 'forgot-password');
      setOtpTimer(60);
      toast({
        title: 'OTP Resent',
        description: 'A new verification code has been sent to your email.',
      });
    } catch (error) {
      toast({
        title: 'Failed to Resend',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setResendingOTP(false);
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-8 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="container mx-auto px-4 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
            <KeyRound className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-800 mb-4">
            Reset Your <span className="text-blue-600">Password</span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed text-lg">
            {step === 'email' && "Enter your email to receive a verification code"}
            {step === 'otp' && "Enter the 6-digit code sent to your email"}
            {step === 'newPassword' && "Create a new secure password"}
            {step === 'success' && "Your password has been reset successfully!"}
          </p>
        </div>
      </section>

      {/* Reset Password Form Section */}
      <section className="py-8 md:py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-lg p-6 md:p-8 border border-gray-200 shadow-md">
              {/* Step 1: Enter Email */}
              {step === 'email' && (
                <>
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-800 flex items-center justify-center">
                      <Mail className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                      Forgot Password?
                    </h2>
                    <p className="text-gray-600">Enter your email to receive an OTP</p>
                  </div>

                  <form onSubmit={handleSendOTP} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          className="pl-10 h-11 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-blue-900 hover:bg-blue-800 text-white px-8 py-6 text-base font-medium rounded-lg"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Shield className="w-5 h-5 mr-2" />
                          Send OTP
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </Button>
                  </form>

                  <div className="mt-6 text-center">
                    <p className="text-gray-600">
                      Remember your password?{' '}
                      <Link to="/login" className="text-blue-600 font-semibold hover:underline">
                        Login here
                      </Link>
                    </p>
                  </div>
                </>
              )}

              {/* Step 2: Enter OTP */}
              {step === 'otp' && (
                <>
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                      <Shield className="w-8 h-8 text-blue-600" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                      Verify OTP
                    </h2>
                    <p className="text-gray-600">
                      We've sent a code to<br />
                      <span className="font-semibold text-gray-900">{email}</span>
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <Label className="text-center block mb-4">Enter 6-Digit Code</Label>
                      <OTPInput onComplete={handleVerifyOTP} disabled={false} />
                    </div>

                    <div className="text-center space-y-2">
                      <p className="text-sm text-gray-600">
                        Didn't receive the code?
                      </p>
                      <Button
                        type="button"
                        variant="link"
                        onClick={handleResendOTP}
                        disabled={otpTimer > 0 || resendingOTP}
                        className="text-blue-600 hover:text-blue-700 font-semibold"
                      >
                        {resendingOTP ? 'Sending...' : otpTimer > 0 ? `Resend in ${otpTimer}s` : 'Resend OTP'}
                      </Button>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep('email')}
                      className="w-full"
                    >
                      Change Email
                    </Button>
                  </div>
                </>
              )}

              {/* Step 3: Enter New Password */}
              {step === 'newPassword' && (
                <>
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                      <Lock className="w-8 h-8 text-blue-600" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                      Create New Password
                    </h2>
                    <p className="text-gray-600">Enter your new password</p>
                  </div>

                  <form onSubmit={handleResetPassword} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-sm font-medium">New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="newPassword"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter new password"
                          className="pl-10 pr-10 h-11 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500">Must be at least 6 characters</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirm new password"
                          className="pl-10 pr-10 h-11 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-blue-900 hover:bg-blue-800 text-white px-8 py-6 text-base font-medium rounded-lg"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Resetting...
                        </>
                      ) : (
                        <>
                          <Lock className="w-5 h-5 mr-2" />
                          Reset Password
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </Button>
                  </form>
                </>
              )}

              {/* Step 4: Success */}
              {step === 'success' && (
                <div className="text-center py-8">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="w-12 h-12 text-green-600" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                    Password Reset Successful!
                  </h2>
                  <p className="text-gray-600 mb-6">
                    You can now login with your new password
                  </p>
                  <Button
                    onClick={() => navigate('/login')}
                    className="bg-blue-900 hover:bg-blue-800 text-white px-8 py-3 rounded-lg"
                  >
                    Go to Login
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-[#233a95] py-12 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div className="text-white max-w-md">
              <p className="text-sm mb-2 opacity-90">₹20 discount for your first order</p>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Join our newsletter and get...</h2>
              <p className="text-sm opacity-80 mb-6">
                Join our email subscription now to get updates on promotions and coupons.
              </p>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Your email address"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60 rounded-lg"
                />
                <Button className="bg-white text-blue-900 hover:bg-gray-100 px-6 rounded-lg font-semibold">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Coupon Image - Bottom Right */}
        <div className="absolute bottom-0 right-8 md:right-16 z-20">
          <img 
            src={couponImage} 
            alt="50% Discount Coupon" 
            className="w-64 md:w-80 h-auto drop-shadow-2xl"
          />
        </div>
        
        {/* Background decoration */}
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl -z-0" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl -z-0" />
      </section>
    </Layout>
  );
};

export default ForgotPasswordPage;
