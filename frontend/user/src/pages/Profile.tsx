import { Layout } from '@/components/layout/Layout';
import { useState, useEffect, useRef } from 'react';
import { User as UserIcon, Package, CreditCard, Gift, Heart, Bell, LogOut, ChevronRight, Edit, Sparkles, Camera, Trash2, Users, Copy, Share2, Check, TrendingUp, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';
import { TeamTreeNode } from '@/components/TeamTreeNode';
import { 
  getUserTeam, 
  getCurrentUserProfile, 
  updateUserProfile as updateProfileAPI,
  updateUserEmail as updateEmailAPI,
  updateUserMobile as updateMobileAPI,
  getUserAddresses,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
  getCommissionsFromMember,
  getTeamCommissionEarnings,
  getUserPayoutStatus,
  type TeamMember,
  type Address 
} from '@/services/profileService';
import couponImage from '@/assets/coupon image.webp';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser, deleteAccount } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeSection, setActiveSection] = useState('profile');
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingMobile, setIsEditingMobile] = useState(false);
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isMemberCommissionDialogOpen, setIsMemberCommissionDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [memberCommissionData, setMemberCommissionData] = useState<any>(null);
  const [loadingMemberCommission, setLoadingMemberCommission] = useState(false);
  const [teamData, setTeamData] = useState<TeamMember | null>(null);
  const [isLoadingTeam, setIsLoadingTeam] = useState(false);
  const [teamCommissionData, setTeamCommissionData] = useState<any>(null);
  const [isLoadingTeamCommission, setIsLoadingTeamCommission] = useState(false);
  const [payoutData, setPayoutData] = useState<any>(null);
  const [isLoadingPayout, setIsLoadingPayout] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [copiedReferral, setCopiedReferral] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [formData, setFormData] = useState({
    firstName: 'Chintu',
    lastName: 'Raj',
    email: 'chinturajmuz2020@gmail.com',
    mobile: '+917481819464',
    gender: 'male'
  });
  const [addressForm, setAddressForm] = useState({
    name: '',
    mobile: '',
    pincode: '',
    locality: '',
    address: '',
    city: '',
    state: '',
    landmark: '',
    alternatePhone: '',
    addressType: 'home'
  });

  // Load profile data on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoadingProfile(true);
        const response = await getCurrentUserProfile();
        const profileData = response.data;
        setFormData({
          firstName: profileData.firstName || '',
          lastName: profileData.lastName || '',
          email: profileData.email || '',
          mobile: profileData.mobile || '',
          gender: profileData.gender || 'male'
        });
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setIsLoadingProfile(false);
      }
    };
    if (user) {
      loadProfile();
    }
  }, [user]);

  // Scroll to top with smooth animation when section changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeSection]);

  // Load team data when team section is active
  useEffect(() => {
    const loadTeamData = async () => {
      if ((activeSection === 'team' || activeSection === 'referral') && user?.id && !teamData) {
        setIsLoadingTeam(true);
        try {
          const response = await getUserTeam(user.id);
          setTeamData(response.data);
        } catch (error) {
          toast({
            title: 'Error',
            description: 'Failed to load team data',
            variant: 'destructive',
          });
        } finally {
          setIsLoadingTeam(false);
        }
      }
      
      // Load team commission earnings when on team section
      if (activeSection === 'team' && user?.id && !teamCommissionData) {
        setIsLoadingTeamCommission(true);
        try {
          const response = await getTeamCommissionEarnings(user.id);
          setTeamCommissionData(response.data);
        } catch (error) {
          console.error('Error loading team commission data:', error);
          toast({
            title: 'Error',
            description: 'Failed to load team commission data',
            variant: 'destructive',
          });
        } finally {
          setIsLoadingTeamCommission(false);
        }
      }
      
      // Load payout status when on team section
      if (activeSection === 'team' && user?.id && !payoutData) {
        setIsLoadingPayout(true);
        try {
          const response = await getUserPayoutStatus();
          setPayoutData(response.data);
        } catch (error) {
          console.error('Error loading payout data:', error);
          toast({
            title: 'Error',
            description: 'Failed to load payout status',
            variant: 'destructive',
          });
        } finally {
          setIsLoadingPayout(false);
        }
      }
    };
    loadTeamData();
  }, [activeSection, user?.id, teamData, teamCommissionData, payoutData]);

  // Load addresses when addresses section is active
  useEffect(() => {
    const loadAddresses = async () => {
      if (activeSection === 'addresses') {
        setIsLoadingAddresses(true);
        try {
          const response = await getUserAddresses();
          setAddresses(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
          toast({
            title: 'Error',
            description: 'Failed to load addresses',
            variant: 'destructive',
          });
        } finally {
          setIsLoadingAddresses(false);
        }
      }
    };
    loadAddresses();
  }, [activeSection]);

  const handleSavePersonal = async () => {
    try {
      await updateProfileAPI({
        firstName: formData.firstName,
        lastName: formData.lastName,
        gender: formData.gender
      });
      setIsEditingPersonal(false);
      toast({
        title: 'Success',
        description: 'Personal information updated successfully!',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update profile',
        variant: 'destructive',
      });
    }
  };

  const handleSaveEmail = async () => {
    try {
      await updateEmailAPI(formData.email);
      setIsEditingEmail(false);
      toast({
        title: 'Success',
        description: 'Email updated successfully!',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update email',
        variant: 'destructive',
      });
    }
  };

  const handleSaveMobile = async () => {
    try {
      await updateMobileAPI(formData.mobile);
      setIsEditingMobile(false);
      toast({
        title: 'Success',
        description: 'Mobile number updated successfully!',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update mobile',
        variant: 'destructive',
      });
    }
  };

  const handleAddAddress = () => {
    setIsAddressDialogOpen(true);
  };

  const handleSaveAddress = async () => {
    try {
      await addUserAddress(addressForm as any);
      toast({
        title: 'Success',
        description: 'Address saved successfully!',
      });
      setIsAddressDialogOpen(false);
      setAddressForm({
        name: '',
        mobile: '',
        pincode: '',
        locality: '',
        address: '',
        city: '',
        state: '',
        landmark: '',
        alternatePhone: '',
        addressType: 'home'
      });
      // Reload addresses
      const response = await getUserAddresses();
      setAddresses(Array.isArray(response.data) ? response.data : []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save address',
        variant: 'destructive',
      });
    }
  };

  const handleAddGiftCard = () => {
    alert('Add gift card functionality - Enter your gift card code');
  };

  const handleAddUPI = () => {
    alert('Add UPI ID functionality - Enter your UPI ID');
  };

  const handleAddCard = () => {
    alert('Add card functionality - Enter your card details');
  };

  const handleTrackOrder = () => {
    navigate('/orders');
  };

  const handleHelpCenter = () => {
    navigate('/contact');
  };

  const handleCopyReferralCode = () => {
    if (user?.myReferralCode) {
      navigator.clipboard.writeText(user.myReferralCode);
      setCopiedReferral(true);
      toast({
        title: 'Copied!',
        description: 'Referral code copied to clipboard',
      });
      setTimeout(() => setCopiedReferral(false), 2000);
    }
  };

  const handleCopyReferralLink = () => {
    if (user?.myReferralCode) {
      const referralLink = `${window.location.origin}/register?ref=${user.myReferralCode}`;
      navigator.clipboard.writeText(referralLink);
      setCopiedLink(true);
      toast({
        title: 'Copied!',
        description: 'Referral link copied to clipboard',
      });
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleShareReferral = async () => {
    if (user?.myReferralCode) {
      const referralLink = `${window.location.origin}/register?ref=${user.myReferralCode}`;
      const shareText = `Join Flourisel and start earning! Use my referral code: ${user.myReferralCode}\n${referralLink}`;
      
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Join Flourisel',
            text: shareText,
          });
        } catch (error) {
          console.log('Share cancelled');
        }
      } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(shareText);
        toast({
          title: 'Copied!',
          description: 'Referral text copied to clipboard',
        });
      }
    }
  };

  const handleMemberClick = async (member: TeamMember) => {
    setSelectedMember(member);
    setIsMemberCommissionDialogOpen(true);
    setLoadingMemberCommission(true);
    
    try {
      const data = await getCommissionsFromMember(member._id);
      
      // Calculate summary from the data
      const summary = {
        totalEarned: 0,
        pendingAmount: 0,
        totalTransactions: data.total || 0,
        creditedCount: 0,
        pendingCount: 0
      };
      
      if (data.data && Array.isArray(data.data)) {
        data.data.forEach((commission: any) => {
          if (commission.status === 'credited') {
            summary.totalEarned += commission.amount;
            summary.creditedCount++;
          } else if (commission.status === 'pending') {
            summary.pendingAmount += commission.amount;
            summary.pendingCount++;
          }
        });
      }
      
      setMemberCommissionData({
        summary,
        commissions: data.data || []
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load commission data',
        variant: 'destructive',
      });
    } finally {
      setLoadingMemberCommission(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      reader.onloadend = async () => {
        try {
          const base64String = reader.result as string;
          await updateProfileAPI({ profileImage: base64String });
          if (updateUser) {
            await updateUser({ profileImage: base64String });
          }
          toast({
            title: 'Profile image updated',
            description: 'Your profile picture has been updated successfully.',
          });
        } catch (error) {
          toast({
            title: 'Update failed',
            description: 'Failed to update profile image. Please try again.',
            variant: 'destructive',
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteAccount = async () => {
    if (user?.email) {
      try {
        await deleteAccount(user.email);
        toast({
          title: 'Account Deleted',
          description: 'Your account has been permanently deleted.',
        });
        setIsDeleteDialogOpen(false);
        navigate('/register');
      } catch (error) {
        toast({
          title: 'Delete failed',
          description: 'Failed to delete account. Please try again.',
          variant: 'destructive',
        });
      }
    }
  };

  // User data
  const userData = user || {
    firstName: 'Guest',
    lastName: 'User',
    email: 'guest@example.com',
    mobile: '+91XXXXXXXXXX',
    gender: 'male'
  };

  const menuItems = [
    { id: 'orders', label: 'MY ORDERS', icon: Package, hasChevron: true },
    { id: 'referral', label: 'REFERRAL', icon: Share2, hasChevron: true },
    { id: 'account', label: 'ACCOUNT SETTINGS', icon: UserIcon, children: [
      { id: 'profile', label: 'Profile Information' },
      { id: 'addresses', label: 'Manage Addresses' },
      // { id: 'pan', label: 'PAN Card Information' },
    ]},
    { id: 'payments', label: 'PAYMENTS', icon: CreditCard, children: [
      { id: 'gift-cards', label: 'Gift Cards', badge: '₹0' },
      { id: 'saved-upi', label: 'Saved UPI' },
      { id: 'saved-cards', label: 'Saved Cards' },
    ]},
    { id: 'stuff', label: 'MY STUFF', icon: Gift, children: [
      { id: 'coupons', label: 'My Coupons' },
      { id: 'reviews', label: 'My Reviews & Ratings' },
      { id: 'notifications', label: 'All Notifications' },
      { id: 'wishlist', label: 'My Wishlist' },
    ]},
    { id: 'team', label: 'MY TEAM', icon: UserIcon, hasChevron: true },
  ];

  const faqs = [
    {
      question: 'What happens when I update my email address (or mobile number)?',
      answer: 'Your login email id (or mobile number) changes, likewise. You\'ll receive all your account related communication on your updated email address (or mobile number).'
    },
    {
      question: 'When will my Flourisel account be updated with the new email address (or mobile number)?',
      answer: 'It happens as soon as you confirm the verification code sent to your email (or mobile) and save the changes.'
    },
    {
      question: 'What happens to my existing Flourisel account when I update my email address (or mobile number)?',
      answer: 'Updating your email address (or mobile number) doesn\'t invalidate your account. Your account remains fully functional. You\'ll continue seeing your Order history, saved information and personal details.'
    },
    {
      question: 'Does my Seller account get affected when I update my email address?',
      answer: 'Flourisel has a \'single sign-on\' policy. Any changes will reflect in your Seller account also.'
    }
  ];

  const renderContent = () => {
    if (activeSection === 'profile') {
      return (
        <div className="space-y-6 animate-in slide-in-from-top-4 duration-300">
          {/* Personal Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800">Personal Information</h3>
              {!isEditingPersonal ? (
                <Button 
                  variant="ghost" 
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50" 
                  onClick={() => setIsEditingPersonal(true)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <Button 
                  className="bg-blue-900 hover:bg-blue-800 text-white"
                  onClick={handleSavePersonal}
                >
                  Save
                </Button>
              )}
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2">First Name</Label>
                  <Input 
                    value={formData.firstName} 
                    disabled={!isEditingPersonal} 
                    className={!isEditingPersonal ? "bg-gray-50 border-gray-200" : "border-gray-300"}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2">Last Name</Label>
                  <Input 
                    value={formData.lastName} 
                    disabled={!isEditingPersonal} 
                    className={!isEditingPersonal ? "bg-gray-50 border-gray-200" : "border-gray-300"}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-2 block">Your Gender</Label>
                <RadioGroup 
                  value={formData.gender} 
                  disabled={!isEditingPersonal} 
                  className="flex gap-6"
                  onValueChange={(value) => setFormData({...formData, gender: value})}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male">Male</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female">Female</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>

          {/* Email Address */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800">Email Address</h3>
              {!isEditingEmail ? (
                <Button 
                  variant="ghost" 
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50" 
                  onClick={() => setIsEditingEmail(true)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <Button 
                  className="bg-blue-900 hover:bg-blue-800 text-white"
                  onClick={handleSaveEmail}
                >
                  Save
                </Button>
              )}
            </div>
            <Input 
              value={formData.email} 
              disabled={!isEditingEmail} 
              className={!isEditingEmail ? "bg-gray-50 border-gray-200" : "border-gray-300"}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          {/* Mobile Number */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800">Mobile Number</h3>
              {!isEditingMobile ? (
                <Button 
                  variant="ghost" 
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50" 
                  onClick={() => setIsEditingMobile(true)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <Button 
                  className="bg-blue-900 hover:bg-blue-800 text-white"
                  onClick={handleSaveMobile}
                >
                  Save
                </Button>
              )}
            </div>
            <Input 
              value={formData.mobile} 
              disabled={!isEditingMobile} 
              className={!isEditingMobile ? "bg-gray-50 border-gray-200" : "border-gray-300"}
              onChange={(e) => setFormData({...formData, mobile: e.target.value})}
            />
          </div>

          {/* FAQs */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-6">FAQs</h3>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index}>
                  <h4 className="font-semibold text-sm text-gray-800 mb-2">{faq.question}</h4>
                  <p className="text-sm text-gray-600">{faq.answer}</p>
                  {index < faqs.length - 1 && <div className="border-t border-gray-200 mt-6" />}
                </div>
              ))}
              
              <div className="border-t border-gray-200 pt-6">
                <Button 
                  variant="link" 
                  className="text-red-600 hover:text-red-700 p-0 h-auto"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeSection === 'orders') {
      navigate('/orders');
      return null;
    }

    if (activeSection === 'referral') {
      return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 animate-in slide-in-from-top-4 duration-300">
          <h3 className="text-lg font-bold text-gray-800 mb-2">Share Your Referral Code</h3>
          <p className="text-sm text-gray-500 mb-6">Invite others to join Flourisel and build your team</p>
          
          {/* Referral Code Display */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Your Referral Code</p>
                <p className="text-3xl font-bold text-blue-900">{user?.myReferralCode}</p>
              </div>
              <Button
                onClick={handleCopyReferralCode}
                className="bg-blue-900 hover:bg-blue-800 text-white"
              >
                {copiedReferral ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Code
                  </>
                )}
              </Button>
            </div>
            
            {/* Referral Link */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Referral Link</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm bg-gray-50 px-3 py-2 rounded border border-gray-200 overflow-x-auto">
                  {window.location.origin}/register?ref={user?.myReferralCode}
                </code>
                <Button
                  onClick={handleCopyReferralLink}
                  size="sm"
                  variant="outline"
                >
                  {copiedLink ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Share Buttons */}
          <div className="space-y-4 mb-6">
            <h4 className="font-semibold text-gray-800">Share via</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                onClick={handleShareReferral}
                className="bg-green-600 hover:bg-green-700 text-white justify-start"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share with Others
              </Button>
              
              <Button
                onClick={() => {
                  const referralLink = `${window.location.origin}/register?ref=${user?.myReferralCode}`;
                  const whatsappText = `Join Flourisel and start earning! Use my referral code: ${user?.myReferralCode}%0A${referralLink}`;
                  window.open(`https://wa.me/?text=${whatsappText}`, '_blank');
                }}
                className="bg-[#25D366] hover:bg-[#20BA5A] text-white justify-start"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                Share on WhatsApp
              </Button>
              
              <Button
                onClick={() => {
                  const referralLink = `${window.location.origin}/register?ref=${user?.myReferralCode}`;
                  const telegramText = `Join Flourisel and start earning! Use my referral code: ${user?.myReferralCode}\n${referralLink}`;
                  window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(telegramText)}`, '_blank');
                }}
                className="bg-[#0088cc] hover:bg-[#0077b3] text-white justify-start"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
                Share on Telegram
              </Button>
              
              <Button
                onClick={() => {
                  const referralLink = `${window.location.origin}/register?ref=${user?.myReferralCode}`;
                  const facebookText = `Join Flourisel and start earning! Use my referral code: ${user?.myReferralCode}`;
                  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}&quote=${encodeURIComponent(facebookText)}`, '_blank');
                }}
                className="bg-[#1877F2] hover:bg-[#166FE5] text-white justify-start"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Share on Facebook
              </Button>
            </div>
          </div>

          {/* Team Stats */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-purple-600" />
              <h4 className="font-semibold text-gray-800">Your Team</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-900">{teamData?.teamCount || 0}</p>
                <p className="text-sm text-gray-600">Team Members</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-900">{user?.myReferralCode}</p>
                <p className="text-sm text-gray-600">Your Code</p>
              </div>
            </div>
            
            <Button
              onClick={() => setActiveSection('team')}
              variant="outline"
              className="w-full mt-4"
            >
              <Users className="w-4 h-4 mr-2" />
              View Team Details
            </Button>
          </div>
          
          {/* How it Works */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-gray-800 mb-2">How it Works</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">1.</span>
                <span>Share your referral code or link with friends and family</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">2.</span>
                <span>They register using your code</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">3.</span>
                <span>They become part of your team and you earn from their purchases</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">4.</span>
                <span>Build your team and increase your earnings!</span>
              </li>
            </ul>
          </div>

          {/* Commission Structure */}
          <div className="mt-6 p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-6 h-6 text-green-600" />
              <h4 className="font-bold text-gray-800 text-lg">4-Level Commission Structure</h4>
            </div>
            
            <div className="space-y-4">
              {/* Direct Referral */}
              <div className="bg-white rounded-lg p-4 border-2 border-green-300">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-green-600">Level 1</Badge>
                  <p className="font-semibold text-gray-800">Direct Referral (Your Team)</p>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-700">
                    <span className="font-bold text-green-700">🎁 First Sale Bonus:</span> Earn <span className="font-bold">10%</span> (6% + 4% bonus)
                  </p>
                  <p className="text-gray-700">
                    <span className="font-bold text-green-700">📈 Regular Sales:</span> Earn <span className="font-bold">6%</span> on all subsequent sales
                  </p>
                  <p className="text-xs text-gray-600 mt-2 bg-green-50 p-2 rounded">
                    Example: ₹499 product → First sale: ₹49.90, Next sales: ₹29.94 each
                  </p>
                </div>
              </div>

              {/* Level 2 */}
              <div className="bg-white rounded-lg p-4 border border-gray-300">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-blue-600">Level 2</Badge>
                  <p className="font-semibold text-gray-800">When Level 1 Member Sells</p>
                </div>
                <div className="space-y-1 text-sm text-gray-700">
                  <p>• Level 1 earns: <span className="font-bold">6%</span></p>
                  <p>• You earn: <span className="font-bold">4%</span></p>
                </div>
              </div>

              {/* Level 3 */}
              <div className="bg-white rounded-lg p-4 border border-gray-300">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-purple-600">Level 3</Badge>
                  <p className="font-semibold text-gray-800">When Level 2 Member Sells</p>
                </div>
                <div className="space-y-1 text-sm text-gray-700">
                  <p>• Level 2 earns: <span className="font-bold">6%</span></p>
                  <p>• Level 1 earns: <span className="font-bold">4%</span></p>
                  <p>• You earn: <span className="font-bold">2%</span></p>
                </div>
              </div>

              {/* Level 4 */}
              <div className="bg-white rounded-lg p-4 border border-gray-300">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-orange-600">Level 4</Badge>
                  <p className="font-semibold text-gray-800">When Level 3 Member Sells</p>
                </div>
                <div className="space-y-1 text-sm text-gray-700">
                  <p>• Level 3 earns: <span className="font-bold">6%</span></p>
                  <p>• Level 2 earns: <span className="font-bold">4%</span></p>
                  <p>• Level 1 earns: <span className="font-bold">2%</span></p>
                  <p>• You earn: <span className="font-bold">1%</span></p>
                </div>
              </div>

              {/* Important Note */}
              <div className="bg-red-50 rounded-lg p-4 border-2 border-red-200">
                <p className="text-sm font-semibold text-red-800 mb-2">⚠️ Important:</p>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• Commission calculated directly on product price</li>
                  <li>• You can earn up to Level 4 only</li>
                  <li>• Level 5+ members are not visible to you</li>
                  <li>• No commission on Level 5+ sales</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeSection === 'addresses') {
      return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 animate-in slide-in-from-top-4 duration-300">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Manage Addresses</h3>
          <p className="text-sm text-gray-500 mb-6">Manage your saved addresses</p>
          
          {isLoadingAddresses ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : addresses.length > 0 ? (
            <div className="space-y-4 mb-4">
              {addresses.map((addr) => (
                <div key={addr._id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-semibold text-gray-900">{addr.name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          addr.addressType === 'home' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                        }`}>
                          {addr.addressType.toUpperCase()}
                        </span>
                        {addr.isDefault && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">DEFAULT</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700">{addr.address}</p>
                      <p className="text-sm text-gray-700">{addr.locality}</p>
                      <p className="text-sm text-gray-700">{addr.city}, {addr.state} - {addr.pincode}</p>
                      {addr.landmark && <p className="text-sm text-gray-600">Landmark: {addr.landmark}</p>}
                      <p className="text-sm text-gray-600 mt-2">Mobile: {addr.mobile}</p>
                      {addr.alternatePhone && <p className="text-sm text-gray-600">Alt: {addr.alternatePhone}</p>}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={async () => {
                        try {
                          await deleteUserAddress(addr._id);
                          toast({
                            title: 'Success',
                            description: 'Address deleted successfully',
                          });
                          const response = await getUserAddresses();
                          setAddresses(Array.isArray(response.data) ? response.data : []);
                        } catch (error: any) {
                          toast({
                            title: 'Error',
                            description: error.response?.data?.message || 'Failed to delete address',
                            variant: 'destructive',
                          });
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 mb-4">No saved addresses yet.</p>
          )}
          
          <Button 
            className="bg-blue-900 hover:bg-blue-800 text-white"
            onClick={handleAddAddress}
          >
            Add New Address
          </Button>
        </div>
      );
    }

    if (activeSection === 'gift-cards') {
      return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 animate-in slide-in-from-top-4 duration-300">
          <h3 className="text-lg font-bold text-gray-800 mb-2">Gift Cards</h3>
          <p className="text-sm text-gray-500 mb-6">Manage your gift cards</p>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-gray-700">Current Balance</p>
              <p className="text-2xl font-bold text-green-600">₹0</p>
            </div>
            <Button 
              className="bg-blue-900 hover:bg-blue-800 text-white"
              onClick={handleAddGiftCard}
            >
              Add Gift Card
            </Button>
          </div>
        </div>
      );
    }

    if (activeSection === 'saved-upi') {
      return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 animate-in slide-in-from-top-4 duration-300">
          <h3 className="text-lg font-bold text-gray-800 mb-2">Saved UPI</h3>
          <p className="text-sm text-gray-500 mb-6">Manage your saved UPI IDs</p>
          <p className="text-gray-600 mb-4">No saved UPI IDs yet.</p>
          <Button 
            className="bg-blue-900 hover:bg-blue-800 text-white"
            onClick={handleAddUPI}
          >
            Add UPI ID
          </Button>
        </div>
      );
    }

    if (activeSection === 'saved-cards') {
      return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 animate-in slide-in-from-top-4 duration-300">
          <h3 className="text-lg font-bold text-gray-800 mb-2">Saved Cards</h3>
          <p className="text-sm text-gray-500 mb-6">Manage your saved payment cards</p>
          <p className="text-gray-600 mb-4">No saved cards yet.</p>
          <Button 
            className="bg-blue-900 hover:bg-blue-800 text-white"
            onClick={handleAddCard}
          >
            Add Card
          </Button>
        </div>
      );
    }

    if (activeSection === 'coupons') {
      return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 animate-in slide-in-from-top-4 duration-300">
          <h3 className="text-lg font-bold text-gray-800 mb-2">My Coupons</h3>
          <p className="text-sm text-gray-500 mb-6">View and use your available coupons</p>
          <p className="text-gray-600">No coupons available.</p>
        </div>
      );
    }

    if (activeSection === 'reviews') {
      return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 animate-in slide-in-from-top-4 duration-300">
          <h3 className="text-lg font-bold text-gray-800 mb-2">My Reviews & Ratings</h3>
          <p className="text-sm text-gray-500 mb-6">View and manage your product reviews</p>
          <p className="text-gray-600">You haven't reviewed any products yet.</p>
        </div>
      );
    }

    if (activeSection === 'notifications') {
      return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 animate-in slide-in-from-top-4 duration-300">
          <h3 className="text-lg font-bold text-gray-800 mb-2">All Notifications</h3>
          <p className="text-sm text-gray-500 mb-6">View all your notifications</p>
          <p className="text-gray-600">No new notifications.</p>
        </div>
      );
    }

    if (activeSection === 'wishlist') {
      return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 animate-in slide-in-from-top-4 duration-300">
          <h3 className="text-lg font-bold text-gray-800 mb-2">My Wishlist</h3>
          <p className="text-sm text-gray-500 mb-6">Items you've saved for later</p>
          <Button 
            className="bg-blue-900 hover:bg-blue-800 text-white"
            onClick={() => navigate('/wishlist')}
          >
            View Wishlist
          </Button>
        </div>
      );
    }

    if (activeSection === 'team') {
      return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">My Team</h3>
              <p className="text-sm text-gray-500">View your referral hierarchy</p>
            </div>
            {teamData && (
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-700">Total Team Size</p>
                <p className="text-2xl font-bold text-blue-600">{teamData.totalTeamSize}</p>
              </div>
            )}
          </div>
          
          {/* Team Commission Earnings Card */}
          {isLoadingTeamCommission ? (
            <div className="mb-6 p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
            </div>
          ) : teamCommissionData && (
            <div className="mb-6 p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-6 h-6 text-green-600" />
                <h4 className="font-bold text-gray-800 text-lg">Your Commission from Team Sales</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <p className="text-sm text-gray-600 mb-1">Direct Sales Commission</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ₹{(teamCommissionData.directCommissionEarned || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">From your own sales</p>
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <p className="text-sm text-gray-600 mb-1">Team Commission</p>
                  <p className="text-2xl font-bold text-green-600">
                    ₹{(teamCommissionData.referralCommissionEarned || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">From team hierarchy sales</p>
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <p className="text-sm text-gray-600 mb-1">Total Commission</p>
                  <p className="text-2xl font-bold text-purple-600">
                    ₹{(teamCommissionData.totalCommissionEarned || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">All time earnings</p>
                </div>
              </div>
              
              {/* Breakdown by status */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-sm font-semibold text-gray-700 mb-3">Team Commission Breakdown</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <p className="text-xs text-gray-600 mb-1">Credited</p>
                    <p className="text-lg font-bold text-green-600">
                      ₹{(teamCommissionData.teamCommissionBreakdown?.credited || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600 mb-1">Pending</p>
                    <p className="text-lg font-bold text-orange-600">
                      ₹{(teamCommissionData.teamCommissionBreakdown?.pending || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600 mb-1">Total</p>
                    <p className="text-lg font-bold text-purple-600">
                      ₹{(teamCommissionData.teamCommissionBreakdown?.total || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Payout Status Card */}
          {isLoadingPayout ? (
            <div className="mb-6 p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            </div>
          ) : payoutData && (
            <div className="mb-6 p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-6 h-6 text-purple-600" />
                <h4 className="font-bold text-gray-800 text-lg">Payout Status</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-white rounded-lg p-4 border-2 border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Available for Withdrawal</p>
                      <p className="text-2xl font-bold text-green-600">
                        ₹{(payoutData.availableForWithdrawal || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {payoutData.canWithdraw ? (
                    <p className="text-xs text-green-700 mt-2 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Ready for withdrawal
                    </p>
                  ) : (
                    <p className="text-xs text-orange-700 mt-2">
                      Minimum ₹{payoutData.minimumWithdrawal} required
                    </p>
                  )}
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-orange-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Pending Commission</p>
                      <p className="text-2xl font-bold text-orange-600">
                        ₹{(payoutData.pendingCommission || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">From undelivered orders</p>
                </div>
              </div>
              
              {/* Payout Summary */}
              {payoutData.payoutSummary && (
                <div className="bg-white rounded-lg p-4 border border-gray-200 mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Payout History Summary</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <p className="text-xs text-gray-600 mb-1">Completed</p>
                      <p className="text-lg font-bold text-green-600">
                        ₹{(payoutData.payoutSummary.completed || 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600 mb-1">Processing</p>
                      <p className="text-lg font-bold text-blue-600">
                        ₹{(payoutData.payoutSummary.processing || 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600 mb-1">Pending</p>
                      <p className="text-lg font-bold text-orange-600">
                        ₹{(payoutData.payoutSummary.pending || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Recent Payouts */}
              {payoutData.recentPayouts && payoutData.recentPayouts.length > 0 && (
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Recent Payouts</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {payoutData.recentPayouts.map((payout: any) => (
                      <div key={payout._id} className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-800">{payout.payoutId}</p>
                            <Badge 
                              variant={
                                payout.status === 'completed' ? 'default' : 
                                payout.status === 'processing' ? 'secondary' : 
                                payout.status === 'failed' ? 'destructive' : 'secondary'
                              }
                              className="text-xs"
                            >
                              {payout.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600">
                            {new Date(payout.date).toLocaleDateString('en-IN')} • {payout.method}
                          </p>
                        </div>
                        <p className="text-sm font-bold text-green-600">₹{payout.amount.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {isLoadingTeam ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading team data...</p>
              </div>
            </div>
          ) : teamData ? (
            <div>
              {teamData.children && teamData.children.length > 0 ? (
                <div className="overflow-x-auto pb-6">
                  <div className="min-w-max p-6">
                    <TeamTreeNode member={teamData} isRoot={true} onMemberClick={handleMemberClick} />
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">No team members yet</p>
                  <p className="text-sm text-gray-500">
                    Share your referral code: <span className="font-semibold text-blue-600">{user?.myReferralCode}</span>
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">Failed to load team data</p>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 animate-in slide-in-from-top-4 duration-300">
        <h3 className="text-lg font-bold text-gray-800 mb-2">Coming Soon</h3>
        <p className="text-sm text-gray-500">This section is under development</p>
      </div>
    );
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            My <span className="text-blue-600">Profile</span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Manage your account settings and preferences
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border border-gray-200 sticky top-24">
                {/* User Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="relative group">
                      <Avatar className="w-16 h-16">
                        {user?.profileImage ? (
                          <AvatarImage src={user.profileImage} alt={`${userData.firstName} ${userData.lastName}`} />
                        ) : (
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-lg">
                            {userData.firstName?.[0]}{userData.lastName?.[0]}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors shadow-lg"
                        title="Change profile picture"
                      >
                        <Camera className="w-3 h-3" />
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleProfileImageChange}
                        className="hidden"
                      />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Hello,</p>
                      <p className="font-semibold text-gray-800">{userData.firstName} {userData.lastName}</p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  {menuItems.map((item) => (
                    <div key={item.id}>
                      <button
                        onClick={() => item.hasChevron ? setActiveSection(item.id) : null}
                        className={`w-full flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors ${
                          activeSection === item.id && !item.children ? 'bg-blue-50 text-blue-600' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="w-5 h-5 text-blue-600" />
                          <span className="text-sm font-medium">{item.label}</span>
                        </div>
                        {item.hasChevron && <ChevronRight className="w-4 h-4" />}
                      </button>
                      
                      {item.children && (
                        <div className="pl-6">
                          {item.children.map((child) => (
                            <button
                              key={child.id}
                              onClick={() => setActiveSection(child.id)}
                              className={`w-full flex items-center justify-between px-6 py-2.5 hover:bg-gray-50 transition-colors ${
                                activeSection === child.id ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-600'
                              }`}
                            >
                              <span className="text-sm">{child.label}</span>
                              {child.badge && (
                                <span className="text-xs text-green-600 font-semibold">{child.badge}</span>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  <div className="my-2 px-6">
                    <div className="border-t border-gray-200" />
                  </div>

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-6 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <LogOut className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                </div>

                {/* Frequently Visited */}
                <div className="p-6 border-t border-gray-200">
                  <p className="text-xs font-semibold text-gray-500 mb-3">Frequently Visited:</p>
                  <div className="space-y-2">
                    <Button 
                      variant="link" 
                      className="text-xs p-0 h-auto text-gray-600 hover:text-blue-600"
                      onClick={handleTrackOrder}
                    >
                      Track Order
                    </Button>
                    <br />
                    <Button 
                      variant="link" 
                      className="text-xs p-0 h-auto text-gray-600 hover:text-blue-600"
                      onClick={handleHelpCenter}
                    >
                      Help Center
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {renderContent()}
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

      {/* Add Address Dialog */}
      <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Address</DialogTitle>
            <DialogDescription>
              Please fill in the complete address details
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter your name"
                  value={addressForm.name}
                  onChange={(e) => setAddressForm({...addressForm, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number *</Label>
                <Input
                  id="mobile"
                  placeholder="10-digit mobile number"
                  value={addressForm.mobile}
                  onChange={(e) => setAddressForm({...addressForm, mobile: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode *</Label>
                <Input
                  id="pincode"
                  placeholder="6-digit pincode"
                  value={addressForm.pincode}
                  onChange={(e) => setAddressForm({...addressForm, pincode: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="locality">Locality *</Label>
                <Input
                  id="locality"
                  placeholder="Enter locality/sector"
                  value={addressForm.locality}
                  onChange={(e) => setAddressForm({...addressForm, locality: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address (Area and Street) *</Label>
              <Input
                id="address"
                placeholder="House no., building name"
                value={addressForm.address}
                onChange={(e) => setAddressForm({...addressForm, address: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City/District/Town *</Label>
                <Input
                  id="city"
                  placeholder="Enter city"
                  value={addressForm.city}
                  onChange={(e) => setAddressForm({...addressForm, city: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  placeholder="Enter state"
                  value={addressForm.state}
                  onChange={(e) => setAddressForm({...addressForm, state: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="landmark">Landmark (Optional)</Label>
                <Input
                  id="landmark"
                  placeholder="Nearby landmark"
                  value={addressForm.landmark}
                  onChange={(e) => setAddressForm({...addressForm, landmark: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="alternatePhone">Alternate Phone (Optional)</Label>
                <Input
                  id="alternatePhone"
                  placeholder="10-digit mobile number"
                  value={addressForm.alternatePhone}
                  onChange={(e) => setAddressForm({...addressForm, alternatePhone: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Address Type *</Label>
              <RadioGroup 
                value={addressForm.addressType}
                onValueChange={(value) => setAddressForm({...addressForm, addressType: value})}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="home" id="home" />
                  <Label htmlFor="home">Home</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="work" id="work" />
                  <Label htmlFor="work">Work</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddressDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAddress}>
              Save Address
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete your account? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-800 font-semibold mb-2">Warning:</p>
              <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
                <li>All your personal data will be permanently deleted</li>
                <li>Your order history will be lost</li>
                <li>You won't be able to login with these credentials</li>
                <li>You'll need to register again to create a new account</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDeleteAccount}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Member Commission Dialog */}
      <Dialog open={isMemberCommissionDialogOpen} onOpenChange={setIsMemberCommissionDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Commission from {selectedMember?.firstName} {selectedMember?.lastName}
            </DialogTitle>
            <DialogDescription>
              View your earnings from this team member's sales
            </DialogDescription>
          </DialogHeader>
          
          {loadingMemberCommission ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading commission data...</p>
              </div>
            </div>
          ) : memberCommissionData ? (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-green-100 rounded-full">
                        <DollarSign className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Earned</p>
                        <p className="text-2xl font-bold text-green-600">
                          ₹{memberCommissionData.summary.totalEarned.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-orange-100 rounded-full">
                        <TrendingUp className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Pending</p>
                        <p className="text-2xl font-bold text-orange-600">
                          ₹{memberCommissionData.summary.pendingAmount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Total Transactions</p>
                  <p className="text-xl font-bold text-gray-800">{memberCommissionData.summary.totalTransactions}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Credited</p>
                  <p className="text-xl font-bold text-green-600">{memberCommissionData.summary.creditedCount}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-xl font-bold text-orange-600">{memberCommissionData.summary.pendingCount}</p>
                </div>
              </div>

              {/* Commission History */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Commission History</h4>
                {memberCommissionData.commissions.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No commissions yet from this member</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {memberCommissionData.commissions.map((commission: any) => (
                      <div key={commission._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-gray-800">{commission.order?.orderId || 'N/A'}</p>
                            <Badge variant={commission.status === 'credited' ? 'default' : commission.status === 'pending' ? 'secondary' : 'destructive'}>
                              {commission.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600">
                            {commission.commissionPercentage}% on ₹{commission.productPrice} • {new Date(commission.createdAt).toLocaleDateString('en-IN')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">+₹{commission.amount.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No commission data available</p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMemberCommissionDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Profile;
