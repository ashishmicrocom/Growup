import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, MessageSquare, Clock, CheckCircle2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { sendContactForm } from '@/services/contactService';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import couponImage from '@/assets/coupon image.webp';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  reply?: string;
  repliedAt?: string;
  status: 'pending' | 'replied' | 'resolved';
  createdAt: string;
}

const ContactPage = () => {
  const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  // Fetch user's messages
  const { data: messagesData, refetch: refetchMessages } = useQuery({
    queryKey: ['my-contact-messages'],
    queryFn: async () => {
      const response = await api.get('/contact/my-messages');
      return response.data;
    },
    enabled: isAuthenticated,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await sendContactForm(formData);
      
      toast({
        title: 'Message Sent!',
        description: response.message,
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });

      // Refetch messages if user is logged in
      if (isAuthenticated) {
        refetchMessages();
      }
    } catch (error: any) {
      toast({
        title: 'Failed to send message',
        description: error.response?.data?.message || 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      {/* Get In Touch Section */}
      <section className="py-8 sm:py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-3 sm:mb-4">Get In Touch</h1>
            <p className="text-sm sm:text-base text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
              Have questions about our reseller program or need support? We're here to help you grow your business. Reach out to us through any of the channels below.
            </p>
          </div>

          {/* Contact Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
            {/* Address Card */}
            <div className="bg-gray-100 rounded-lg p-6 sm:p-8 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Flourisel Head Office</h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Jaipur, Rajasthan, India - 302001
              </p>
            </div>

            {/* Phone Card */}
            <div className="bg-gray-100 rounded-lg p-6 sm:p-8 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                <Phone className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              </div>
              <a href="tel:+919461923285" className="text-base sm:text-lg font-semibold text-gray-800 mb-2 block hover:text-blue-600 transition-colors">
                +91 9461923285
              </a>
              <p className="text-xs sm:text-sm text-gray-600">
                Mon-Sat, 10:00 AM - 7:00 PM
              </p>
            </div>

            {/* Email Card */}
            <div className="bg-gray-100 rounded-lg p-6 sm:p-8 text-center sm:col-span-2 md:col-span-1">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                <Mail className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              </div>
              <a href="mailto:support@theFlourisel.com" className="text-base sm:text-lg font-semibold text-gray-800 mb-2 block hover:text-blue-600 transition-colors break-all">
                support@theFlourisel.com
              </a>
              <p className="text-xs sm:text-sm text-gray-600">
                24/7 Email Support Available
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Send Us Section */}
      <section className="py-8 sm:py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-3 sm:mb-4">Send Us</h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed px-4">
              Fill out the form below and our team will get back to you within 24 hours. We're committed to helping you succeed in your reselling journey.
            </p>
          </div>

          {/* Contact Form */}
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-6 sm:p-8 md:p-12">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Your name *</label>
                  <Input 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="" 
                    required 
                    className="h-10 sm:h-12 bg-gray-50 border-gray-200 focus:border-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Your email *</label>
                  <Input 
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="" 
                    required 
                    className="h-10 sm:h-12 bg-gray-50 border-gray-200 focus:border-blue-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Subject *</label>
                <Input 
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="" 
                  required 
                  className="h-10 sm:h-12 bg-gray-50 border-gray-200 focus:border-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Your message</label>
                <Textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder=""
                  rows={5}
                  className="bg-gray-50 border-gray-200 focus:border-blue-500 resize-none text-sm"
                />
              </div>

              <Button 
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto bg-blue-900 hover:bg-blue-800 text-white px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-base font-medium rounded-lg"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                    Sending...
                  </>
                ) : (
                  'Send Message'
                )}
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* My Messages Section - Only shown if user is logged in */}
      {isAuthenticated && messagesData && messagesData.data && messagesData.data.length > 0 && (
        <section className="py-8 sm:py-12 md:py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8 sm:mb-10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-3">My Messages</h2>
              <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
                View your sent messages and admin replies
              </p>
            </div>

            <div className="max-w-4xl mx-auto space-y-4">
              {messagesData.data.map((message: ContactMessage) => (
                <div
                  key={message._id}
                  className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedMessage(message)}
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <h3 className="font-semibold text-gray-900 truncate">{message.subject}</h3>
                        {message.status === 'replied' && (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Replied
                          </Badge>
                        )}
                        {message.status === 'pending' && (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <Clock className="w-3 h-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">{message.message}</p>
                      {message.reply && (
                        <div className="bg-green-50 border-l-4 border-green-500 p-3 mt-2 rounded">
                          <p className="text-sm font-medium text-green-900 mb-1">Admin Reply:</p>
                          <p className="text-sm text-gray-700 line-clamp-2">{message.reply}</p>
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 flex-shrink-0">
                      {new Date(message.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Message Detail Dialog */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Message Details</DialogTitle>
            <DialogDescription>
              View your message and admin response
            </DialogDescription>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Subject</label>
                <p className="text-sm text-gray-900 mt-1">{selectedMessage.subject}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Your Message</label>
                <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap bg-gray-50 p-3 rounded">
                  {selectedMessage.message}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Sent On</label>
                <p className="text-sm text-gray-600 mt-1">
                  {new Date(selectedMessage.createdAt).toLocaleString('en-IN')}
                </p>
              </div>
              {selectedMessage.reply ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <label className="text-sm font-medium text-green-800">Admin Reply</label>
                  <p className="text-sm text-gray-900 mt-2 whitespace-pre-wrap">
                    {selectedMessage.reply}
                  </p>
                  {selectedMessage.repliedAt && (
                    <p className="text-xs text-gray-500 mt-2">
                      Replied on {new Date(selectedMessage.repliedAt).toLocaleString('en-IN')}
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <Clock className="w-4 h-4 inline mr-2" />
                    Waiting for admin reply...
                  </p>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Badge className={selectedMessage.status === 'replied' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                  {selectedMessage.status}
                </Badge>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Newsletter Section */}
      <section className="bg-[#233a95] py-8 sm:py-10 md:py-12 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8 relative z-10">
            <div className="text-white max-w-md text-center md:text-left">
              <p className="text-xs sm:text-sm mb-2 opacity-90">₹20 discount for your first order</p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">Join our newsletter and get...</h2>
              <p className="text-xs sm:text-sm opacity-80 mb-4 sm:mb-6">
                Join our email subscription now to get updates on promotions and coupons.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  type="email"
                  placeholder="Your email address"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60 rounded-lg text-sm h-10 sm:h-11"
                />
                <Button className="bg-white text-blue-900 hover:bg-gray-100 px-4 sm:px-6 rounded-lg font-semibold text-sm h-10 sm:h-11 whitespace-nowrap">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Coupon Image - Bottom Right - Hidden on mobile */}
        <div className="hidden md:block absolute bottom-0 right-4 lg:right-8 xl:right-16 z-20">
          <img 
            src={couponImage} 
            alt="50% Discount Coupon" 
            className="w-48 lg:w-64 xl:w-80 h-auto drop-shadow-2xl"
          />
        </div>
        
        {/* Background decoration */}
        <div className="absolute bottom-0 left-0 w-48 sm:w-64 h-48 sm:h-64 bg-blue-600/20 rounded-full blur-3xl -z-0" />
        <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-purple-600/10 rounded-full blur-3xl -z-0" />
      </section>
    </Layout>
  );
};

export default ContactPage;
