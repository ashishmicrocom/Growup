import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Target, Heart, Award, Users, ArrowRight, TrendingUp, Shield, Sparkles, CheckCircle, Building2, Globe, Zap } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import couponImage from '@/assets/coupon image.webp';

const AboutPage = () => {
  const stats = [
    { value: '50K+', label: 'Active Resellers', color: 'text-blue-600' },
    { value: '1L+', label: 'Orders Delivered', color: 'text-green-600' },
    { value: '28', label: 'States Covered', color: 'text-purple-600' },
    { value: '5K+', label: 'Products', color: 'text-orange-600' },
  ];

  const values = [
    {
      icon: Heart,
      title: 'Transparency',
      description: 'No hidden fees, clear earnings, honest communication. What you see is what you get.',
    },
    {
      icon: Users,
      title: 'Community',
      description: 'We grow together. Our success is tied to the success of our resellers.',
    },
    {
      icon: Award,
      title: 'Quality',
      description: 'Every product is carefully curated to ensure customer satisfaction and your reputation.',
    },
    {
      icon: TrendingUp,
      title: 'Growth Focus',
      description: 'Continuous support and training to help you scale your reselling business.',
    },
  ];

  const recognitions = [
    'Startup India (DPIIT)',
    'iStart Rajasthan',
    'Wadhwani Foundation',
    'MSME Registered',
  ];

  const milestones = [
    { year: '2020', title: 'Founded', description: 'Flourisel journey begins' },
    { year: '2021', title: '10K Resellers', description: 'Reached first milestone' },
    { year: '2023', title: 'Pan-India', description: 'Expanded to 28 states' },
    { year: '2024', title: '50K+ Strong', description: 'Leading reseller platform' },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Empowering India's <span className="text-blue-600">Dream Entrepreneurs</span>
            </h1>
            <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed text-lg">
              Building India's largest reseller community with zero investment, 
              zero risk, and unlimited earning potential.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white rounded-lg p-6 text-center shadow-md">
                <div className={`text-4xl font-bold ${stat.color} mb-2`}>
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                Democratizing <span className="text-blue-600">Entrepreneurship</span>
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-4">
                Flourisel was founded with a simple yet powerful mission: to democratize entrepreneurship 
                and make it accessible to every Indian, regardless of their financial background.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                We've eliminated all traditional business barriers - no investment needed, no inventory 
                management, no delivery hassles. Just pure focus on what truly matters: connecting quality 
                products with customers and earning fair commissions.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-100 px-4 py-2 rounded-full">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  <span>Zero Investment</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-100 px-4 py-2 rounded-full">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  <span>100% Transparent</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-100 px-4 py-2 rounded-full">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  <span>Pan-India Reach</span>
                </div>
              </div>
            </div>

            {/* Milestones */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
              {milestones.map((milestone) => (
                <div key={milestone.year} className="bg-gray-50 p-6 rounded-lg text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{milestone.year}</div>
                  <div className="text-sm font-semibold text-gray-800 mb-1">{milestone.title}</div>
                  <div className="text-xs text-gray-600">{milestone.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              What Drives Us <span className="text-blue-600">Forward</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              These principles guide everything we do at Flourisel.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {values.map((value) => (
              <div key={value.title} className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                  <value.icon className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{value.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recognition Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8">
            Recognized & <span className="text-blue-600">Supported By</span>
          </h2>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 max-w-4xl mx-auto">
            {recognitions.map((org) => (
              <div key={org} className="px-6 md:px-8 py-4 bg-gray-50 rounded-lg shadow-md border border-gray-200">
                <span className="font-semibold text-gray-800 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  {org}
                </span>
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
            Ready to Start Your <span className="text-blue-600">Entrepreneurial Journey?</span>
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto text-lg">
            Join 50,000+ successful resellers who are already earning from home. 
            No investment, no risk, unlimited potential.
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
                <Globe className="w-5 h-5 mr-2" />
                Explore Products
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

export default AboutPage;
