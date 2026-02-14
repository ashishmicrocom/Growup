import { AdminLayout } from "@/components/layout/AdminLayout";
import { DataTable } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TeamTreeNode } from "@/components/TeamTreeNode";
import { cn } from "@/lib/utils";
import { Eye, MoreVertical, UserPlus, X, Users as UsersIcon, DollarSign, TrendingUp, CreditCard, Check, Wallet } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllUsers, toggleUserStatus, createUser, updateUser, deleteUser, getUserTeam, getUserCommissions, getUserTeamEarnings, getUserTeamCommissionEarnings, getUserPayoutStatus, type User, type CreateUserData, type UpdateUserData, type TeamMember } from "@/services/userService";
import { createPayout, type Payout } from "@/services/earningService";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const statusStyles = {
  active: "status-active",
  blocked: "status-blocked",
};

const roleStyles = {
  user: "bg-muted text-muted-foreground",
  admin: "bg-primary/10 text-primary",
};

export default function Users() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);
  const [isPayoutDialogOpen, setIsPayoutDialogOpen] = useState(false);
  const [teamData, setTeamData] = useState<TeamMember | null>(null);
  const [isLoadingTeam, setIsLoadingTeam] = useState(false);
  const [isCommissionDialogOpen, setIsCommissionDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [commissionData, setCommissionData] = useState<any>(null);
  const [isLoadingCommission, setIsLoadingCommission] = useState(false);
  const [teamEarningsData, setTeamEarningsData] = useState<any>(null);
  const [teamCommissionData, setTeamCommissionData] = useState<any>(null);
  const [payoutData, setPayoutData] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "user" as "user" | "admin",
  });
  const [payoutFormData, setPayoutFormData] = useState({
    amount: "",
    method: "Bank Transfer" as Payout["method"],
    status: "pending" as Payout["status"],
    transactionId: "",
    notes: "",
  });

  // Build query params based on filters
  const queryParams = {
    search: searchQuery || undefined,
    role: roleFilter || undefined,
    status: statusFilter || undefined,
  };

  // Fetch users with filters
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['users', queryParams],
    queryFn: () => getAllUsers(queryParams),
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: (userData: CreateUserData) => createUser(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsAddDialogOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "User created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create user",
        variant: "destructive",
      });
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserData }) => updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      resetForm();
      toast({
        title: "Success",
        description: "User updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update user",
        variant: "destructive",
      });
    },
  });

  // Toggle user status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: (userId: string) => toggleUserStatus(userId),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "Success",
        description: response.data.status === 'active' 
          ? "User activated successfully" 
          : "User blocked successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update user status",
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete user",
        variant: "destructive",
      });
    },
  });

  // Create payout mutation
  const createPayoutMutation = useMutation({
    mutationFn: createPayout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payouts"] });
      queryClient.invalidateQueries({ queryKey: ["earningsStats"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "Success",
        description: "Payout created successfully",
      });
      setIsPayoutDialogOpen(false);
      setSelectedUser(null);
      resetPayoutForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create payout",
        variant: "destructive",
      });
    },
  });

  const users = data?.data || [];

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      password: "",
      role: "user",
    });
  };

  const resetPayoutForm = () => {
    setPayoutFormData({
      amount: "",
      method: "Bank Transfer",
      status: "pending",
      transactionId: "",
      notes: "",
    });
  };

  const handleAddUser = () => {
    setIsAddDialogOpen(true);
    resetForm();
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      password: "",
      role: user.role,
    });
    setIsEditDialogOpen(true);
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsViewDialogOpen(true);
  };

  const handleSubmitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createUserMutation.mutate(formData);
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUser) {
      const updateData: UpdateUserData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
      };
      updateUserMutation.mutate({ id: selectedUser._id, data: updateData });
    }
  };

  const handleToggleStatus = (userId: string) => {
    toggleStatusMutation.mutate(userId);
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedUser) {
      deleteUserMutation.mutate(selectedUser._id);
    }
  };

  const handleCreatePayout = (user: User) => {
    setSelectedUser(user);
    resetPayoutForm();
    setIsPayoutDialogOpen(true);
  };

  const handleSubmitPayout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !payoutFormData.amount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createPayoutMutation.mutate({
      reseller: `${selectedUser.name} (${selectedUser.email})`,
      amount: parseFloat(payoutFormData.amount),
      method: payoutFormData.method,
      status: payoutFormData.status,
      ...(payoutFormData.transactionId && { transactionId: payoutFormData.transactionId }),
      ...(payoutFormData.notes && { notes: payoutFormData.notes }),
    } as Partial<Payout>);
  };

  const handleViewTeam = async (user: User) => {
    setSelectedUser(user);
    setIsTeamDialogOpen(true);
    setIsLoadingTeam(true);
    try {
      const [teamResponse, earningsResponse, commissionResponse, payoutResponse] = await Promise.all([
        getUserTeam(user._id),
        getUserTeamEarnings(user._id),
        getUserTeamCommissionEarnings(user._id),
        getUserPayoutStatus(user._id)
      ]);
      setTeamData(teamResponse.data);
      setTeamEarningsData(earningsResponse.data);
      setTeamCommissionData(commissionResponse.data);
      setPayoutData(payoutResponse.data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load team data',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingTeam(false);
    }
  };

  const handleMemberClick = async (member: TeamMember) => {
    if (!selectedUser) return;
    
    setSelectedMember(member);
    setIsCommissionDialogOpen(true);
    setIsLoadingCommission(true);
    
    try {
      const response = await getUserCommissions({
        userId: selectedUser._id,
        sellerId: member._id,
        limit: 100
      });
      
      // Calculate summary
      const summary = {
        totalEarned: 0,
        pendingAmount: 0,
        totalTransactions: response.total || 0,
        creditedCount: 0,
        pendingCount: 0
      };
      
      if (response.data && Array.isArray(response.data)) {
        response.data.forEach((commission: any) => {
          if (commission.status === 'credited') {
            summary.totalEarned += commission.amount;
            summary.creditedCount++;
          } else if (commission.status === 'pending') {
            summary.pendingAmount += commission.amount;
            summary.pendingCount++;
          }
        });
      }
      
      setCommissionData({
        summary,
        commissions: response.data || []
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load commission data',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingCommission(false);
    }
  };

  const handleFilterChange = (value: string) => {
    // Determine if it's a role or status filter
    if (value === "all") {
      setRoleFilter("");
      setStatusFilter("");
    } else if (value === "user" || value === "admin") {
      setRoleFilter(value);
      setStatusFilter("");
    } else if (value === "active" || value === "blocked") {
      setStatusFilter(value);
      setRoleFilter("");
    }
  };

  const columns = [
    {
      key: "name",
      label: "User",
      render: (user: User) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            {user.profileImage && (
              <AvatarImage src={user.profileImage} alt={user.name} />
            )}
            <AvatarFallback className="bg-primary/10 text-primary text-sm">
              {user.name.split(" ").map((n) => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-foreground">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
      ),
    },
  {
    key: "phone",
    label: "Phone",
    render: (user: User) => (
      <span className="text-sm text-muted-foreground">{user.phone}</span>
    ),
  },
  {
    key: "role",
    label: "Role",
    render: (user: User) => (
      <Badge variant="outline" className={cn("capitalize", roleStyles[user.role])}>
        {user.role}
      </Badge>
    ),
  },
  {
    key: "status",
    label: "Status",
    render: (user: User) => (
      <Badge variant="outline" className={cn("capitalize", statusStyles[user.status])}>
        {user.status}
      </Badge>
    ),
  },
  {
    key: "joinedDate",
    label: "Joined",
    render: (user: User) => (
      <span className="text-sm text-muted-foreground">{user.joinedDate}</span>
    ),
  },
  {
    key: "totalOrders",
    label: "Orders",
    render: (user: User) => (
      <span className="font-medium text-foreground">{user.totalOrders}</span>
    ),
  },
  {
    key: "totalEarnings",
    label: "Earnings",
    render: (user: User) => (
      <span className="font-medium text-foreground">
        ₹{(user.totalCommissionEarned || 0).toLocaleString()}
      </span>
    ),
  },
  {
    key: "actions",
    label: "Actions",
    render: (user: User) => (
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => handleViewUser(user)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => {
                e.preventDefault();
                handleViewUser(user);
              }}>
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.preventDefault();
                handleViewTeam(user);
              }}>
                View Team
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.preventDefault();
                handleEditUser(user);
              }}>
                Edit User
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.preventDefault();
                handleCreatePayout(user);
              }}>
                <Wallet className="mr-2 h-4 w-4" />
                Create Payout
              </DropdownMenuItem>
              <DropdownMenuItem 
                className={user.status === "active" ? "text-destructive" : "text-success"}
                onClick={(e) => {
                  e.preventDefault();
                  handleToggleStatus(user._id);
                }}
              >
                {user.status === "active" ? "Block User" : "Activate User"}
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive"
                onClick={(e) => {
                  e.preventDefault();
                  handleDeleteClick(user);
                }}
              >
                Delete User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <AdminLayout title="Users" subtitle="Manage all users and admins">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </AdminLayout>
    );
  }

  if (isError) {
    return (
      <AdminLayout title="Users" subtitle="Manage all users and admins">
        <div className="flex items-center justify-center h-64">
          <p className="text-destructive">Error loading users: {error?.message}</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Users" subtitle="Manage all users and admins">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-muted">
              Total: {users.length}
            </Badge>
            <Badge variant="outline" className="bg-primary/10 text-primary">
              Admins: {users.filter((u) => u.role === "admin").length}
            </Badge>
            <Badge variant="outline" className="status-active">
              Active: {users.filter((u) => u.status === "active").length}
            </Badge>
          </div>
          <Button 
            className="bg-primary hover:bg-primary/90"
            onClick={handleAddUser}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>

        {/* Data Table */}
        <DataTable
          data={users}
          columns={columns}
          searchPlaceholder="Search by name or email..."
          searchKey="name"
          filterOptions={[
            { label: "Active", value: "active" },
            { label: "Blocked", value: "blocked" },
            { label: "Admin", value: "admin" },
            { label: "User", value: "user" },
          ]}
          onFilterChange={handleFilterChange}
        />

        {/* Add User Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new user account. Fill in all required fields.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitCreate}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="Enter full name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    placeholder="email@example.com"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    placeholder="Minimum 6 characters"
                    minLength={6}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">Role *</Label>
                  <Select 
                    value={formData.role} 
                    onValueChange={(value: "user" | "admin") => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createUserMutation.isPending}
                >
                  {createUserMutation.isPending ? "Creating..." : "Create User"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user information. Leave password empty to keep current password.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitEdit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Name *</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="Enter full name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-email">Email *</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    placeholder="email@example.com"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-phone">Phone *</Label>
                  <Input
                    id="edit-phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-role">Role *</Label>
                  <Select 
                    value={formData.role} 
                    onValueChange={(value: "user" | "admin") => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateUserMutation.isPending}
                >
                  {updateUserMutation.isPending ? "Updating..." : "Update User"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* View User Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
              <DialogDescription>
                Complete information about the user
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="grid gap-4 py-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    {selectedUser.profileImage && (
                      <AvatarImage src={selectedUser.profileImage} alt={selectedUser.name} />
                    )}
                    <AvatarFallback className="bg-primary/10 text-primary text-xl">
                      {selectedUser.name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">{selectedUser.name}</h3>
                    <Badge variant="outline" className={cn("capitalize mt-1", roleStyles[selectedUser.role])}>
                      {selectedUser.role}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p className="font-medium">{selectedUser.email}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Phone</Label>
                    <p className="font-medium">{selectedUser.phone}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Status</Label>
                    <div className="mt-1">
                      <Badge variant="outline" className={cn("capitalize", statusStyles[selectedUser.status])}>
                        {selectedUser.status}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Joined Date</Label>
                    <p className="font-medium">{selectedUser.joinedDate}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Total Orders</Label>
                    <p className="font-medium">{selectedUser.totalOrders}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Total Earnings</Label>
                    <p className="font-medium">₹{selectedUser.totalEarnings.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsViewDialogOpen(false)}
              >
                Close
              </Button>
              {selectedUser && (
                <Button 
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    handleEditUser(selectedUser);
                  }}
                >
                  Edit User
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Delete User</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this user? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="py-4">
                <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {selectedUser.name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{selectedUser.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsDeleteDialogOpen(false)}
                disabled={deleteUserMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={deleteUserMutation.isPending}
              >
                {deleteUserMutation.isPending ? "Deleting..." : "Delete User"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Team Hierarchy Dialog */}
        <Dialog open={isTeamDialogOpen} onOpenChange={setIsTeamDialogOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Team Hierarchy</DialogTitle>
              <DialogDescription>
                View the referral team structure for {selectedUser?.name}
              </DialogDescription>
            </DialogHeader>
            {isLoadingTeam ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading team data...</p>
                </div>
              </div>
            ) : teamData ? (
              <div className="py-4">
                {/* Team Earnings Summary */}
                {/* {teamEarningsData && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-lg mb-3 text-gray-800">Team Earnings Summary</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-xs text-muted-foreground mb-1">Personal Earnings</p>
                        <p className="text-xl font-bold text-blue-600">₹{teamEarningsData.personalEarnings.toLocaleString()}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-xs text-muted-foreground mb-1">Team Earnings</p>
                        <p className="text-xl font-bold text-green-600">₹{teamEarningsData.teamEarnings.toLocaleString()}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-xs text-muted-foreground mb-1">Total Earnings</p>
                        <p className="text-xl font-bold text-purple-600">₹{teamEarningsData.totalEarnings.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                )} */}
                
                {/* Team Commission Earnings */}
                {teamCommissionData && (
                  <div className="mb-6 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
                    <div className="flex items-center gap-2 mb-3">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <h4 className="font-semibold text-lg text-gray-800">Commission from Team Sales</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                      <div className="bg-white rounded-lg p-3 border border-green-200">
                        <p className="text-xs text-gray-600 mb-1">Direct Sales Commission</p>
                        <p className="text-lg font-bold text-blue-600">
                          ₹{(teamCommissionData.directCommissionEarned || 0).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">From own sales</p>
                      </div>
                      
                      <div className="bg-white rounded-lg p-3 border border-green-200">
                        <p className="text-xs text-gray-600 mb-1">Team Commission</p>
                        <p className="text-lg font-bold text-green-600">
                          ₹{(teamCommissionData.referralCommissionEarned || 0).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">From team sales</p>
                      </div>
                      
                      <div className="bg-white rounded-lg p-3 border border-purple-200">
                        <p className="text-xs text-gray-600 mb-1">Total Commission</p>
                        <p className="text-lg font-bold text-purple-600">
                          ₹{(teamCommissionData.totalCommissionEarned || 0).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">All time</p>
                      </div>
                    </div>
                    
                    {/* Breakdown by status */}
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <p className="text-xs font-semibold text-gray-700 mb-2">Team Commission Breakdown</p>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="text-center">
                          <p className="text-xs text-gray-600 mb-1">Credited</p>
                          <p className="text-sm font-bold text-green-600">
                            ₹{(teamCommissionData.teamCommissionBreakdown?.credited || 0).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-600 mb-1">Pending</p>
                          <p className="text-sm font-bold text-orange-600">
                            ₹{(teamCommissionData.teamCommissionBreakdown?.pending || 0).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-600 mb-1">Total</p>
                          <p className="text-sm font-bold text-purple-600">
                            ₹{(teamCommissionData.teamCommissionBreakdown?.total || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Payout Status */}
                {payoutData && (
                  <div className="mb-6 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
                    <div className="flex items-center gap-2 mb-3">
                      <CreditCard className="w-5 h-5 text-purple-600" />
                      <h4 className="font-semibold text-lg text-gray-800">Payout Status</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      <div className="bg-white rounded-lg p-3 border-2 border-green-200">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <DollarSign className="w-4 h-4 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-gray-600">Available for Withdrawal</p>
                            <p className="text-lg font-bold text-green-600">
                              ₹{(payoutData.availableForWithdrawal || 0).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        {payoutData.canWithdraw ? (
                          <p className="text-xs text-green-700 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Ready for withdrawal
                          </p>
                        ) : (
                          <p className="text-xs text-orange-700">
                            Minimum ₹{payoutData.minimumWithdrawal} required
                          </p>
                        )}
                      </div>
                      
                      <div className="bg-white rounded-lg p-3 border border-orange-200">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                            <TrendingUp className="w-4 h-4 text-orange-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-gray-600">Pending Commission</p>
                            <p className="text-lg font-bold text-orange-600">
                              ₹{(payoutData.pendingCommission || 0).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600">From undelivered orders</p>
                      </div>
                    </div>
                    
                    {/* Payout Summary */}
                    {payoutData.payoutSummary && (
                      <div className="bg-white rounded-lg p-3 border border-gray-200 mb-3">
                        <p className="text-xs font-semibold text-gray-700 mb-2">Payout History Summary</p>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-center">
                            <p className="text-xs text-gray-600 mb-1">Completed</p>
                            <p className="text-sm font-bold text-green-600">
                              ₹{(payoutData.payoutSummary.completed || 0).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-600 mb-1">Processing</p>
                            <p className="text-sm font-bold text-blue-600">
                              ₹{(payoutData.payoutSummary.processing || 0).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-600 mb-1">Pending</p>
                            <p className="text-sm font-bold text-orange-600">
                              ₹{(payoutData.payoutSummary.pending || 0).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Recent Payouts */}
                    {payoutData.recentPayouts && payoutData.recentPayouts.length > 0 && (
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-xs font-semibold text-gray-700 mb-2">Recent Payouts</p>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {payoutData.recentPayouts.map((payout: any) => (
                            <div key={payout._id} className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="text-xs font-medium text-gray-800">{payout.payoutId}</p>
                                  <Badge 
                                    variant={
                                      payout.status === 'completed' ? 'default' : 
                                      payout.status === 'processing' ? 'secondary' : 
                                      payout.status === 'failed' ? 'destructive' : 'secondary'
                                    }
                                    className="text-xs py-0 px-1"
                                  >
                                    {payout.status}
                                  </Badge>
                                </div>
                                <p className="text-xs text-gray-600">
                                  {new Date(payout.date).toLocaleDateString('en-IN')} • {payout.method}
                                </p>
                              </div>
                              <p className="text-xs font-bold text-green-600">₹{payout.amount.toLocaleString()}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="mb-6 p-4 bg-primary/5 rounded-lg">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Direct Team</p>
                      <p className="text-2xl font-bold text-primary">{teamData.teamCount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Team</p>
                      <p className="text-2xl font-bold text-primary">{teamData.totalTeamSize}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Referral Code</p>
                      <p className="text-lg font-semibold text-primary">{teamData.myReferralCode}</p>
                    </div>
                  </div>
                </div>
                
                {teamData.children && teamData.children.length > 0 ? (
                  <div className="overflow-x-auto pb-6">
                    <div className="min-w-max p-6">
                      <TeamTreeNode member={teamData} isRoot={true} onMemberClick={handleMemberClick} />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-muted/50 rounded-lg">
                    <UsersIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-2">No team members yet</p>
                    <p className="text-sm text-muted-foreground">
                      Referral code: <span className="font-semibold">{teamData.myReferralCode}</span>
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Failed to load team data</p>
              </div>
            )}
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsTeamDialogOpen(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Commission Dialog */}
        <Dialog open={isCommissionDialogOpen} onOpenChange={setIsCommissionDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Commission from {selectedMember?.name}</DialogTitle>
              <DialogDescription>
                View commissions earned from this team member's sales
              </DialogDescription>
            </DialogHeader>
            {isLoadingCommission ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : commissionData ? (
              <div className="space-y-4">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <p className="text-sm text-gray-600 mb-1">Total Earned</p>
                    <p className="text-2xl font-bold text-green-600">
                      ₹{commissionData.summary.totalEarned.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      From {commissionData.summary.creditedCount} credited transactions
                    </p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                    <p className="text-sm text-gray-600 mb-1">Pending</p>
                    <p className="text-2xl font-bold text-orange-600">
                      ₹{commissionData.summary.pendingAmount.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      From {commissionData.summary.pendingCount} pending transactions
                    </p>
                  </div>
                </div>

                {/* Commission List */}
                <div>
                  <h4 className="font-semibold mb-3">Commission History</h4>
                  {commissionData.commissions.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No commissions yet</p>
                  ) : (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {commissionData.commissions.map((commission: any) => (
                        <div key={commission._id} className="p-3 bg-muted/50 rounded-lg border">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant={commission.status === 'credited' ? 'default' : 'secondary'}>
                              {commission.status}
                            </Badge>
                            <span className="font-bold text-primary">
                              ₹{commission.amount.toFixed(2)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{commission.description}</p>
                          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                            <span>{commission.commissionPercentage}% commission</span>
                            <span>Product: ₹{commission.productPrice}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCommissionDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Payout Dialog */}
        <Dialog open={isPayoutDialogOpen} onOpenChange={setIsPayoutDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Payout</DialogTitle>
              <DialogDescription>
                Create a new payout for {selectedUser?.name}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitPayout}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="payout-user">User</Label>
                  <Input
                    id="payout-user"
                    value={selectedUser ? `${selectedUser.name} (${selectedUser.email})` : ""}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="payout-amount">Amount *</Label>
                  <Input
                    id="payout-amount"
                    type="number"
                    step="0.01"
                    value={payoutFormData.amount}
                    onChange={(e) =>
                      setPayoutFormData({ ...payoutFormData, amount: e.target.value })
                    }
                    placeholder="Enter amount"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="payout-method">Payment Method</Label>
                  <Select
                    value={payoutFormData.method}
                    onValueChange={(value) =>
                      setPayoutFormData({ ...payoutFormData, method: value as Payout["method"] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                      <SelectItem value="UPI">UPI</SelectItem>
                      <SelectItem value="Wallet">Wallet</SelectItem>
                      <SelectItem value="Check">Check</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="payout-status">Status</Label>
                  <Select
                    value={payoutFormData.status}
                    onValueChange={(value) =>
                      setPayoutFormData({ ...payoutFormData, status: value as Payout["status"] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="payout-transactionId">Transaction ID (Optional)</Label>
                  <Input
                    id="payout-transactionId"
                    value={payoutFormData.transactionId}
                    onChange={(e) =>
                      setPayoutFormData({ ...payoutFormData, transactionId: e.target.value })
                    }
                    placeholder="Enter transaction ID"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="payout-notes">Notes (Optional)</Label>
                  <Textarea
                    id="payout-notes"
                    value={payoutFormData.notes}
                    onChange={(e) =>
                      setPayoutFormData({ ...payoutFormData, notes: e.target.value })
                    }
                    placeholder="Add any notes or comments"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsPayoutDialogOpen(false);
                    setSelectedUser(null);
                    resetPayoutForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createPayoutMutation.isPending}
                >
                  {createPayoutMutation.isPending ? "Creating..." : "Create Payout"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
