import { Link } from 'react-router-dom';
import { UserPlus, Share2, Wallet, ArrowRight, CheckCircle, Sparkles, TrendingUp, Shield, Zap, DollarSign } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import couponImage from '@/assets/coupon image.webp';

const HowItWorksPage = () => {
  const steps = [
    {
      number: '01',
      icon: UserPlus,
      title: 'Sign Up for Free',
      description: 'Create your Flourisel account in just 2 minutes. No fees, no documents, no hassles.',
      details: [
        'Enter your name and phone number',
        'Create a secure password',
        'Verify via OTP',
        'Start earning immediately!',
      ],
      iconColor: 'text-blue-600',
    },
    {
      number: '02',
      icon: Share2,
      title: 'Browse & Share Products',
      description: 'Access our catalog of 5000+ premium products and share with your network on any platform.',
      details: [
        'Browse products by category',
        'See your earning on each product',
        'Share on WhatsApp, Instagram, Facebook',
        'Use your unique referral link',
      ],
      iconColor: 'text-purple-600',
    },
    {
      number: '03',
      icon: Wallet,
      title: 'Earn on Every Sale',
      description: 'When someone buys through your link, your commission is credited instantly to your wallet.',
      details: [
        'Commission credited to your wallet',
        'Track all sales in real-time dashboard',
        'Withdraw anytime to your bank',
        'No minimum withdrawal limit',
      ],
      iconColor: 'text-green-600',
    },
  ];

  const benefits = [
    {
      icon: DollarSign,
      title: 'Zero Investment',
      description: 'Start for free, earn from day one',
      iconColor: 'text-yellow-600',
    },
    {
      icon: Shield,
      title: 'No Inventory Risk',
      description: 'We handle all stock management',
      iconColor: 'text-blue-600',
    },
    {
      icon: Zap,
      title: 'No Delivery Hassle',
      description: 'We pack and ship directly to customers',
      iconColor: 'text-orange-600',
    },
    {
      icon: TrendingUp,
      title: 'Real-Time Tracking',
      description: 'Monitor sales & earnings instantly',
      iconColor: 'text-green-600',
    },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              How <span className="text-blue-600">It Works</span>
            </h1>
            <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed text-lg">
              Start earning in 3 simple steps. No investment, no inventory, no risk - just pure earning potential.
            </p>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Your Journey to <span className="text-blue-600">Success</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Follow these simple steps and start your entrepreneurial journey today.
            </p>
          </div>

          <div className="max-w-6xl mx-auto space-y-12">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center"
              >
                <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                  <div className="flex items-start gap-4 mb-6">
                    <span className="text-6xl md:text-7xl font-bold text-blue-100">{step.number}</span>
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-blue-100 flex items-center justify-center">
                      <step.icon className={`w-8 h-8 md:w-10 md:h-10 ${step.iconColor}`} />
                    </div>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">{step.title}</h3>
                  <p className="text-gray-600 text-lg mb-6 leading-relaxed">{step.description}</p>
                  <ul className="space-y-3">
                    {step.details.map((detail, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                        <span className="text-gray-700">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={`relative ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                  <div className="relative bg-gray-50 p-8 md:p-12 rounded-lg shadow-md">
                    <div className="relative aspect-video bg-white rounded-lg flex items-center justify-center border border-gray-200">
                      <step.icon className={`w-24 h-24 md:w-32 md:h-32 ${step.iconColor} opacity-30`} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Why Flourisel is <span className="text-blue-600">Different</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We've removed all traditional business barriers so you can focus on earning.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow text-center"
              >
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                  <benefit.icon className={`w-7 h-7 ${benefit.iconColor}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{benefit.title}</h3>
                <p className="text-sm text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="container mx-auto px-4 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-blue-100 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Ready to <span className="text-blue-600">Get Started?</span>
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto text-lg">
            Join 50,000+ resellers earning from home. Start your journey today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button className="bg-blue-900 hover:bg-blue-800 text-white px-8 py-6 text-base font-medium rounded-lg">
                Join Free Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/products">
              <Button variant="outline" className="border-blue-900 text-blue-900 hover:bg-blue-50 px-8 py-6 text-base font-medium rounded-lg">
                Browse Products
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-sm text-gray-600">
            ✓ Free to join • ✓ No hidden charges • ✓ Instant withdrawal
          </p>
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

export default HowItWorksPage;
