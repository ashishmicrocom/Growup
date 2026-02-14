import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Mail, MailOpen, Trash2, CheckCircle, Eye, Filter, Search, Send } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import api from '@/lib/api';

interface Contact {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  reply?: string;
  repliedAt?: string;
  status: 'pending' | 'replied' | 'resolved';
  type: 'general' | 'referral_request' | 'support' | 'complaint';
  read: boolean;
  createdAt: string;
}

const Contacts = () => {
  const queryClient = useQueryClient();
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [replyText, setReplyText] = useState('');

  // Fetch contacts
  const { data: contactsData, isLoading } = useQuery({
    queryKey: ['contacts', statusFilter, typeFilter],
    queryFn: async () => {
      const params: any = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (typeFilter !== 'all') params.type = typeFilter;
      
      const response = await api.get('/contact', { params });
      return response.data;
    },
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/contact/${id}`, { read: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await api.patch(`/contact/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast({
        title: 'Status updated',
        description: 'Contact status has been updated successfully.',
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/contact/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast({
        title: 'Deleted',
        description: 'Contact has been deleted successfully.',
      });
      setSelectedContact(null);
    },
  });

  // Reply mutation
  const replyMutation = useMutation({
    mutationFn: async ({ id, reply }: { id: string; reply: string }) => {
      await api.post(`/contact/${id}/reply`, { reply });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast({
        title: 'Reply sent',
        description: 'Your reply has been sent and the user will be notified.',
      });
      setReplyText('');
      setSelectedContact(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to send reply',
        variant: 'destructive',
      });
    },
  });

  const handleViewContact = (contact: Contact) => {
    setSelectedContact(contact);
    setReplyText(contact.reply || '');
    if (!contact.read) {
      markAsReadMutation.mutate(contact._id);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'referral_request':
        return 'bg-purple-100 text-purple-800';
      case 'support':
        return 'bg-blue-100 text-blue-800';
      case 'complaint':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'replied':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredContacts = contactsData?.data?.filter((contact: Contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.subject.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <AdminLayout title="Contact Messages">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Contact Messages</h1>
            <p className="text-sm text-gray-600">
              Manage customer inquiries and support requests
            </p>
          </div>
          {contactsData?.unreadCount > 0 && (
            <Badge variant="destructive" className="text-sm">
              {contactsData.unreadCount} Unread
            </Badge>
          )}
        </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by name, email, or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="replied">Replied</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="referral_request">Referral Request</SelectItem>
              <SelectItem value="support">Support</SelectItem>
              <SelectItem value="complaint">Complaint</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Contacts List */}
      <div className="bg-white rounded-lg shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : filteredContacts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No contacts found</div>
        ) : (
          <div className="divide-y">
            {filteredContacts.map((contact: Contact) => (
              <div
                key={contact._id}
                className={`p-4 hover:bg-gray-50 transition-colors ${
                  !contact.read ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1">
                      {contact.read ? (
                        <MailOpen className="w-5 h-5 text-gray-400" />
                      ) : (
                        <Mail className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {contact.name}
                        </h3>
                        {!contact.read && (
                          <Badge variant="destructive" className="text-xs">New</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{contact.email}</p>
                      <p className="text-sm font-medium text-gray-900 mb-2">
                        {contact.subject}
                      </p>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {contact.message}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={getTypeColor(contact.type)}>
                          {contact.type.replace('_', ' ')}
                        </Badge>
                        <Badge className={getStatusColor(contact.status)}>
                          {contact.status}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(contact.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewContact(contact)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* View Contact Dialog */}
      <Dialog open={!!selectedContact} onOpenChange={() => setSelectedContact(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Contact Details</DialogTitle>
            <DialogDescription>
              View and manage contact message
            </DialogDescription>
          </DialogHeader>
          {selectedContact && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Name</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedContact.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedContact.email}</p>
                </div>
                {selectedContact.phone && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Phone</label>
                    <p className="text-sm text-gray-900 mt-1">{selectedContact.phone}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-700">Date</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {new Date(selectedContact.createdAt).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Subject</label>
                <p className="text-sm text-gray-900 mt-1">{selectedContact.subject}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Message</label>
                <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">
                  {selectedContact.message}
                </p>
              </div>
              
              {selectedContact.reply && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <label className="text-sm font-medium text-green-800">Your Reply</label>
                  <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">
                    {selectedContact.reply}
                  </p>
                  {selectedContact.repliedAt && (
                    <p className="text-xs text-gray-500 mt-2">
                      Replied on {new Date(selectedContact.repliedAt).toLocaleString('en-IN')}
                    </p>
                  )}
                </div>
              )}

              {!selectedContact.reply && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Send Reply</label>
                  <Textarea
                    placeholder="Type your reply here..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                  <Button
                    onClick={() => {
                      if (replyText.trim()) {
                        replyMutation.mutate({ id: selectedContact._id, reply: replyText });
                      } else {
                        toast({
                          title: 'Error',
                          description: 'Please enter a reply message',
                          variant: 'destructive',
                        });
                      }
                    }}
                    disabled={replyMutation.isPending}
                    className="w-full"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {replyMutation.isPending ? 'Sending...' : 'Send Reply'}
                  </Button>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Badge className={getTypeColor(selectedContact.type)}>
                  {selectedContact.type.replace('_', ' ')}
                </Badge>
                <Badge className={getStatusColor(selectedContact.status)}>
                  {selectedContact.status}
                </Badge>
              </div>
              <div className="flex justify-between items-center pt-4 border-t">
                <Select
                  value={selectedContact.status}
                  onValueChange={(value) =>
                    updateStatusMutation.mutate({ id: selectedContact._id, status: value })
                  }
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="replied">Replied</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this contact?')) {
                      deleteMutation.mutate(selectedContact._id);
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </AdminLayout>
  );
};

export default Contacts;
