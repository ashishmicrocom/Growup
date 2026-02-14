import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight, LogIn, Sparkles, Shield } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { loginUser, verifyLoginOTP, resendOTP } from '@/services/authService';
import { OTPInput } from '@/components/OTPInput';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import couponImage from '@/assets/coupon image.webp';

const LoginPage = () => {
  const navigate = useNavigate();
  const { isUserRegistered } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showOTPDialog, setShowOTPDialog] = useState(false);
  const [verifyingOTP, setVerifyingOTP] = useState(false);
  const [resendingOTP, setResendingOTP] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [pendingEmail, setPendingEmail] = useState('');

  // Timer effect for OTP resend
  useEffect(() => {
    if (otpTimer > 0) {
      const interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [otpTimer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is registered
    const isRegistered = await isUserRegistered(formData.email);
    
    if (!isRegistered) {
      toast({
        title: 'Cannot Login',
        description: "Can't login before register. Please create an account first.",
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const response = await loginUser(formData);
      
      if (response.data.requiresVerification) {
        setPendingEmail(formData.email);
        setShowOTPDialog(true);
        setOtpTimer(60);
        toast({
          title: 'OTP Sent',
          description: 'Please check your email for the verification code.',
        });
      }
    } catch (error) {
      toast({
        title: 'Login Failed',
        description: error instanceof Error ? error.message : 'An error occurred. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleOTPVerify = async (otp: string) => {
    setVerifyingOTP(true);
    try {
      const response = await verifyLoginOTP(pendingEmail, otp);
      
      if (response.success && response.data.user) {
        // Check if user is admin - admins cannot login to user panel
        if (response.data.user.role === 'admin') {
          toast({
            title: 'Access Denied',
            description: 'Admin users cannot login to the user panel. Please use the admin panel.',
            variant: 'destructive',
          });
          return;
        }

        // Save auth data to localStorage
        const userData = {
          id: response.data.user.id,
          firstName: response.data.user.firstName,
          lastName: response.data.user.lastName,
          email: response.data.user.email,
          mobile: response.data.user.mobile,
          gender: response.data.user.gender,
          profileImage: response.data.user.profileImage,
          myReferralCode: response.data.user.myReferralCode,
          referredBy: response.data.user.referredBy,
          role: response.data.user.role,
        };

        localStorage.setItem('growup-auth', JSON.stringify({
          isAuthenticated: true,
          user: userData,
          token: response.data.token
        }));
        
        toast({
          title: 'Login Successful',
          description: 'Welcome back!',
        });
        
        setShowOTPDialog(false);
        window.location.href = '/';
      }
    } catch (error) {
      toast({
        title: 'Verification Failed',
        description: error instanceof Error ? error.message : 'Invalid OTP. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setVerifyingOTP(false);
    }
  };

  const handleResendOTP = async () => {
    if (otpTimer > 0) return;
    
    setResendingOTP(true);
    try {
      await resendOTP(pendingEmail, 'login');
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
          {/* <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
            <Shield className="w-8 h-8 text-blue-600" />
          </div> */}
          <h1 className="text-3xl md:text-5xl font-bold text-gray-800 mb-4">
            Welcome <span className="text-blue-600">Back!</span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed text-lg">
            Login to access your reseller dashboard and continue earning!
          </p>
        </div>
      </section>

      {/* Login Form Section */}
      <section className="py-8 md:py-4 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-lg p-6 md:p-8 border border-gray-200 shadow-md">
              <div className="text-center mb-8">
                <div className="mx-auto h-12 w-12 rounded-lg bg-blue-700 flex items-center justify-center mb-4 p-0.5">
                  <img src='/public/Screenshot_2026-02-14_132358-removebg-preview.png' alt='logo' className="h-full w-full object-contain rounded-lg" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                  Login to Your Account
                </h2>
                <p className="text-gray-600">Enter your credentials to continue</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email or Phone</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="email"
                      type="text"
                      placeholder="Enter email or phone number"
                      className="pl-10 h-11 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                    <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline font-medium">
                      Forgot Password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      className="pl-10 pr-10 h-11 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full bg-blue-900 hover:bg-blue-800 text-white px-8 py-6 text-base font-medium rounded-lg mt-6">
                  <LogIn className="w-5 h-5 mr-2" />
                  Login to Dashboard
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </form>

              <div className="mt-8 text-center">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-600">New to Flourisel?</span>
                  </div>
                </div>
                
                <Link to="/register">
                  <Button variant="outline" className="w-full mt-4 border-gray-300 text-gray-700 hover:bg-blue-900 rounded-lg">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Join Free to Flourisel
                  </Button>
                </Link>
              </div>
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

      {/* OTP Verification Dialog */}
      <Dialog open={showOTPDialog} onOpenChange={setShowOTPDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <DialogTitle className="text-center text-2xl">Verify Your Login</DialogTitle>
            <DialogDescription className="text-center">
              We've sent a 6-digit verification code to<br />
              <span className="font-semibold text-gray-900">{pendingEmail}</span>
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div>
              <Label className="text-center block mb-4">Enter OTP</Label>
              <OTPInput onComplete={handleOTPVerify} disabled={verifyingOTP} />
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

            {verifyingOTP && (
              <div className="text-center">
                <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-gray-600 mt-2">Verifying...</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default LoginPage;
