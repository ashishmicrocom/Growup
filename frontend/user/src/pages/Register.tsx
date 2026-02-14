import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, CheckCircle, Sparkles, Gift, Award, Users, Camera, Send, Shield } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { validateReferralCode, registerUser, verifyEmail, resendOTP } from '@/services/authService';
import { OTPInput } from '@/components/OTPInput';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import api from '@/lib/api';
import couponImage from '@/assets/coupon image.webp';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register, isUserRegistered } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [profileImage, setProfileImage] = useState<string>('');
  const [referralValidated, setReferralValidated] = useState(false);
  const [referralValidating, setReferralValidating] = useState(false);
  const [referrerName, setReferrerName] = useState<string>('');
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [sendingContact, setSendingContact] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    referralCode: '',
  });
  const [showOTPDialog, setShowOTPDialog] = useState(false);
  const [verifyingOTP, setVerifyingOTP] = useState(false);
  const [resendingOTP, setResendingOTP] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [pendingEmail, setPendingEmail] = useState('');

  // Auto-fill referral code from URL parameter
  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      handleReferralCodeChange(refCode);
    }
  }, [searchParams]);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent bubbling to parent form
    setSendingContact(true);
    
    try {
      await api.post('/contact', {
        ...contactForm,
        subject: 'Referral Code Request',
        type: 'referral_request',
      });
      
      toast({
        title: 'Request Sent!',
        description: 'We will send you a referral code within 24 hours.',
      });
      
      setShowContactDialog(false);
      setContactForm({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      toast({
        title: 'Failed to send request',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setSendingContact(false);
    }
  };

  const handleReferralCodeChange = async (value: string) => {
    setFormData({ ...formData, referralCode: value });
    setReferralValidated(false);
    setReferrerName('');
    
    if (value.length >= 6) {
      setReferralValidating(true);
      const result = await validateReferralCode(value);
      setReferralValidating(false);
      
      if (result.valid) {
        setReferralValidated(true);
        setReferrerName(result.referrerName || '');
        toast({
          title: 'Valid Referral Code',
          description: result.message,
        });
      } else {
        setReferralValidated(false);
        toast({
          title: 'Invalid Referral Code',
          description: result.message,
          variant: 'destructive',
        });
      }
    }
  };

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
    if (!agreed) {
      toast({
        title: 'Please accept terms',
        description: 'You must agree to the terms and conditions.',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.referralCode) {
      toast({
        title: 'Referral Code Required',
        description: 'Please enter a valid referral code to continue.',
        variant: 'destructive',
      });
      return;
    }

    if (!referralValidated) {
      toast({
        title: 'Invalid Referral Code',
        description: 'Please enter a valid referral code.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      // Check if user is already registered
      const isRegistered = await isUserRegistered(formData.email);
      
      if (isRegistered) {
        toast({
          title: 'Email already registered',
          description: 'This email is already registered. Please login.',
          variant: 'destructive',
        });
        return;
      }
      
      const [firstName, ...lastNameParts] = formData.name.split(' ');
      const lastName = lastNameParts.join(' ') || '';
      
      const response = await registerUser({
        firstName,
        lastName,
        email: formData.email,
        mobile: formData.phone,
        gender: 'male',
        password: formData.password,
        profileImage: profileImage || undefined,
        referralCode: formData.referralCode,
      });
      
      if (response.data.requiresVerification) {
        setPendingEmail(formData.email);
        setShowOTPDialog(true);
        setOtpTimer(60);
        toast({
          title: 'OTP Sent',
          description: response.message || 'Please check your email for the verification code.',
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: 'Registration Failed',
        description: error instanceof Error ? error.message : 'An error occurred. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleOTPVerify = async (otp: string) => {
    setVerifyingOTP(true);
    try {
      const response = await verifyEmail(pendingEmail, otp);
      
      if (response.success) {
        // Clear referral code from sessionStorage after successful registration
        sessionStorage.removeItem('sharedReferralCode');
        
        toast({
          title: 'Email Verified!',
          description: 'Your account has been verified successfully.',
        });
        
        setShowOTPDialog(false);
        navigate('/login');
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
      await resendOTP(pendingEmail, 'registration');
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

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please select an image smaller than 2MB.',
          variant: 'destructive',
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
        toast({
          title: 'Image selected',
          description: 'Profile picture has been selected.',
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const benefits = [
    {
      icon: <Gift className="w-5 h-5" />,
      title: 'Zero Investment',
      description: 'Join completely FREE - no hidden charges',
    },
    {
      icon: <Sparkles className="w-5 h-5" />,
      title: 'High Earnings',
      description: 'Earn ₹50 - ₹500 on every product sale',
    },
    {
      icon: <Award className="w-5 h-5" />,
      title: 'No Inventory Hassle',
      description: 'We handle storage & delivery for you',
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: 'Expert Support',
      description: 'Get training & 24/7 support',
    },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="container mx-auto px-4 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
            <Users className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Start Your <span className="text-blue-600">Earning Journey</span>
          </h1>
          <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed text-lg">
            Create your free account in 2 minutes and start earning from home today! • Join 50,000+ Resellers
          </p>
        </div>
      </section>

      {/* Registration Section */}
      <section className="py-12 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start max-w-6xl mx-auto">
            {/* Benefits Cards */}
            <div className="space-y-6">
              <div className="lg:sticky lg:top-24">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8">
                  Why Join as a Reseller?
                </h2>
                <div className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-lg p-5 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                          <span className="text-blue-600">{benefit.icon}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-gray-800 mb-1">
                            {benefit.title}
                          </h3>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {benefit.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Stats */}
                <div className="mt-8 grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">50K+</div>
                    <div className="text-xs text-gray-600">Active Resellers</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200 text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1">100%</div>
                    <div className="text-xs text-gray-600">Free to Join</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Registration Form */}
            <div>
              <div className="bg-white rounded-lg p-6 md:p-8 border border-gray-200 shadow-md">
                <div className="text-center mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                    Join Free to Flourisel
                  </h2>
                  <p className="text-gray-600">Fill in your details to get started</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">Full Name *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="name"
                        placeholder="Enter your full name"
                        className="pl-10 h-11 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* <div className="space-y-2">
                    <Label className="text-sm font-medium">Profile Picture (Optional)</Label>
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Avatar className="w-20 h-20">
                          {profileImage ? (
                            <AvatarImage src={profileImage} alt="Profile" />
                          ) : (
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl">
                              {formData.name ? formData.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'PF'}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute bottom-0 right-0 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors shadow-lg"
                          title="Upload profile picture"
                        >
                          <Camera className="w-4 h-4" />
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleProfileImageChange}
                          className="hidden"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 mb-1">Click the camera icon to upload</p>
                        <p className="text-xs text-gray-400">Max size: 2MB • JPG, PNG</p>
                        {profileImage && (
                          <Button
                            type="button"
                            variant="link"
                            className="text-xs text-red-600 hover:text-red-700 p-0 h-auto mt-1"
                            onClick={() => setProfileImage('')}
                          >
                            Remove image
                          </Button>
                        )}
                      </div>
                    </div>
                  </div> */}

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">Phone Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="phone"
                        placeholder="10 digit mobile number"
                        className="pl-10 h-11 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        className="pl-10 h-11 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a strong password"
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

                  <div className="space-y-2">
                    <Label htmlFor="referral" className="text-sm font-medium">Referral Code *</Label>
                    <div className="relative">
                      <Input
                        id="referral"
                        placeholder="Enter referral code (e.g., ABCDEF1234)"
                        className={`h-11 rounded-lg pr-10 ${
                          referralValidated 
                            ? 'border-green-500 focus:border-green-500 focus:ring-green-500' 
                            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                        }`}
                        value={formData.referralCode}
                        onChange={(e) => handleReferralCodeChange(e.target.value.toUpperCase())}
                        required
                      />
                      {referralValidating && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                      {referralValidated && (
                        <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600" />
                      )}
                    </div>
                    {referralValidated && referrerName && (
                      <p className="text-xs text-green-600">
                        ✓ Valid referral from {referrerName}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">
                        Don't have a referral code? 
                      </p>
                      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
                        <DialogTrigger asChild>
                          <Button type="button" variant="link" className="text-xs text-blue-600 hover:text-blue-700 p-0 h-auto">
                            Request Code
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Request Referral Code</DialogTitle>
                            <DialogDescription>
                              Fill in your details and we'll send you a referral code within 24 hours
                            </DialogDescription>
                          </DialogHeader>
                          <form onSubmit={handleContactSubmit} className="space-y-4">
                            <div>
                              <Label htmlFor="contact-name">Name *</Label>
                              <Input
                                id="contact-name"
                                value={contactForm.name}
                                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                                placeholder="Your full name"
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="contact-email">Email *</Label>
                              <Input
                                id="contact-email"
                                type="email"
                                value={contactForm.email}
                                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                                placeholder="your@email.com"
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="contact-phone">Phone *</Label>
                              <Input
                                id="contact-phone"
                                value={contactForm.phone}
                                onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                                placeholder="Your phone number"
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="contact-message">Message (Optional)</Label>
                              <Textarea
                                id="contact-message"
                                value={contactForm.message}
                                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                                placeholder="Any additional information..."
                                rows={3}
                              />
                            </div>
                            <Button type="submit" className="w-full" disabled={sendingContact}>
                              {sendingContact ? (
                                <>Processing...</>
                              ) : (
                                <>
                                  <Send className="w-4 h-4 mr-2" />
                                  Send Request
                                </>
                              )}
                            </Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <Checkbox
                      id="terms"
                      checked={agreed}
                      onCheckedChange={(checked) => setAgreed(checked as boolean)}
                      className="mt-0.5"
                    />
                    <label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed cursor-pointer">
                      I agree to the{' '}
                      <Link to="/terms" className="text-blue-600 font-semibold hover:underline">Terms & Conditions</Link>
                      {' '}and{' '}
                      <Link to="/privacy" className="text-blue-600 font-semibold hover:underline">Privacy Policy</Link>
                    </label>
                  </div>

                  <Button type="submit" className="w-full bg-blue-900 hover:bg-blue-800 text-white px-8 py-6 text-base font-medium rounded-lg">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Create Free Account
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-gray-600">
                    Already have an account?{' '}
                    <Link to="/login" className="text-blue-600 font-semibold hover:underline">
                      Login here
                    </Link>
                  </p>
                </div>
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
            <DialogTitle className="text-center text-2xl">Verify Your Email</DialogTitle>
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

export default RegisterPage;
