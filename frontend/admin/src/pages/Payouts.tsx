import { AdminLayout } from "@/components/layout/AdminLayout";
import { DataTable } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus, MoreVertical, Eye, Edit, Trash2, CheckCircle2, Ban } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllPayouts,
  createPayout,
  updatePayout,
  updatePayoutStatus,
  deletePayout,
  type Payout,
} from "@/services/earningService";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const statusStyles = {
  completed: "status-active",
  pending: "status-pending",
  processing: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  failed: "status-blocked",
};

export default function Payouts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [methodFilter, setMethodFilter] = useState<string>("");
  const [search, setSearch] = useState("");

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);

  const [formData, setFormData] = useState({
    reseller: "",
    amount: "",
    method: "Bank Transfer" as Payout["method"],
    status: "pending" as Payout["status"],
    transactionId: "",
    notes: "",
  });

  // Fetch payouts
  const { data: payoutsResponse, isLoading } = useQuery({
    queryKey: ["payouts", page, limit, statusFilter, methodFilter, search],
    queryFn: () =>
      getAllPayouts({
        page,
        limit,
        ...(statusFilter && { status: statusFilter }),
        ...(methodFilter && { method: methodFilter }),
        ...(search && { search }),
      }),
  });

  const payouts = payoutsResponse?.data || [];
  const totalPages = payoutsResponse?.pages || 1;

  // Create payout mutation
  const createMutation = useMutation({
    mutationFn: createPayout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payouts"] });
      queryClient.invalidateQueries({ queryKey: ["earningsStats"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "Success",
        description: "Payout created successfully",
      });
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create payout",
        variant: "destructive",
      });
    },
  });

  // Update payout mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Payout> }) =>
      updatePayout(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payouts"] });
      queryClient.invalidateQueries({ queryKey: ["earningsStats"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "Success",
        description: "Payout updated successfully",
      });
      setIsEditDialogOpen(false);
      setSelectedPayout(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update payout",
        variant: "destructive",
      });
    },
  });

  // Update payout status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Payout["status"] }) =>
      updatePayoutStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payouts"] });
      queryClient.invalidateQueries({ queryKey: ["earningsStats"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "Success",
        description: "Payout status updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update status",
        variant: "destructive",
      });
    },
  });

  // Delete payout mutation
  const deleteMutation = useMutation({
    mutationFn: deletePayout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payouts"] });
      queryClient.invalidateQueries({ queryKey: ["earningsStats"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "Success",
        description: "Payout deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      setSelectedPayout(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete payout",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      reseller: "",
      amount: "",
      method: "Bank Transfer",
      status: "pending",
      transactionId: "",
      notes: "",
    });
  };

  const handleCreate = () => {
    if (!formData.reseller || !formData.amount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createMutation.mutate({
      reseller: formData.reseller,
      amount: parseFloat(formData.amount),
      method: formData.method,
      status: formData.status,
      ...(formData.transactionId && { transactionId: formData.transactionId }),
      ...(formData.notes && { notes: formData.notes }),
    } as Partial<Payout>);
  };

  const handleEdit = () => {
    if (!selectedPayout) return;

    updateMutation.mutate({
      id: selectedPayout._id,
      data: {
        reseller: formData.reseller,
        amount: parseFloat(formData.amount),
        method: formData.method,
        status: formData.status,
        ...(formData.transactionId && { transactionId: formData.transactionId }),
        ...(formData.notes && { notes: formData.notes }),
      },
    });
  };

  const handleDelete = () => {
    if (selectedPayout) {
      deleteMutation.mutate(selectedPayout._id);
    }
  };

  const handleStatusChange = (id: string, status: Payout["status"]) => {
    updateStatusMutation.mutate({ id, status });
  };

  const openEditDialog = (payout: Payout) => {
    setSelectedPayout(payout);
    setFormData({
      reseller: payout.reseller,
      amount: payout.amount.toString(),
      method: payout.method,
      status: payout.status,
      transactionId: payout.transactionId || "",
      notes: payout.notes || "",
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (payout: Payout) => {
    setSelectedPayout(payout);
    setIsViewDialogOpen(true);
  };

  const openDeleteDialog = (payout: Payout) => {
    setSelectedPayout(payout);
    setIsDeleteDialogOpen(true);
  };

  const columns = [
    {
      key: "payoutId",
      label: "Payout ID",
      render: (payout: Payout) => (
        <span className="font-medium text-primary">{payout.payoutId}</span>
      ),
    },
    {
      key: "reseller",
      label: "Reseller",
      render: (payout: Payout) => (
        <span className="font-medium text-foreground">{payout.reseller}</span>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      render: (payout: Payout) => (
        <span className="font-medium text-foreground">
          ₹{payout.amount.toLocaleString()}
        </span>
      ),
    },
    {
      key: "method",
      label: "Method",
      render: (payout: Payout) => (
        <span className="text-muted-foreground">{payout.method}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (payout: Payout) => (
        <Badge
          variant="outline"
          className={statusStyles[payout.status as keyof typeof statusStyles]}
        >
          {payout.status}
        </Badge>
      ),
    },
    {
      key: "date",
      label: "Date",
      render: (payout: Payout) => (
        <span className="text-muted-foreground">
          {new Date(payout.date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (payout: Payout) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => openViewDialog(payout)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openEditDialog(payout)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            {payout.status === "pending" && (
              <DropdownMenuItem
                onClick={() => handleStatusChange(payout._id, "processing")}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Mark as Processing
              </DropdownMenuItem>
            )}
            {payout.status === "processing" && (
              <>
                <DropdownMenuItem
                  onClick={() => handleStatusChange(payout._id, "completed")}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                  Mark as Completed
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleStatusChange(payout._id, "failed")}
                >
                  <Ban className="mr-2 h-4 w-4 text-red-600" />
                  Mark as Failed
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuItem
              onClick={() => openDeleteDialog(payout)}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <AdminLayout title="Payouts" subtitle="Manage payout requests and transactions">
      <div className="space-y-6">
        {/* Filters and Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <Input
              placeholder="Search by reseller or payout ID..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="max-w-xs"
            />
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=" ">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={methodFilter}
              onValueChange={(value) => {
                setMethodFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=" ">All Methods</SelectItem>
                <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                <SelectItem value="UPI">UPI</SelectItem>
                <SelectItem value="Wallet">Wallet</SelectItem>
                <SelectItem value="Check">Check</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Payout
          </Button>
        </div>

        {/* Payouts Table */}
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <p className="text-muted-foreground">Loading payouts...</p>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={payouts}
          />
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Create Payout Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Payout</DialogTitle>
            <DialogDescription>
              Create a new payout transaction for a reseller
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reseller">Reseller Name / ID *</Label>
              <Input
                id="reseller"
                value={formData.reseller}
                onChange={(e) =>
                  setFormData({ ...formData, reseller: e.target.value })
                }
                placeholder="Enter reseller name or ID"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                placeholder="Enter amount"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="method">Payment Method</Label>
              <Select
                value={formData.method}
                onValueChange={(value) =>
                  setFormData({ ...formData, method: value as Payout["method"] })
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
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value as Payout["status"] })
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
              <Label htmlFor="transactionId">Transaction ID (Optional)</Label>
              <Input
                id="transactionId"
                value={formData.transactionId}
                onChange={(e) =>
                  setFormData({ ...formData, transactionId: e.target.value })
                }
                placeholder="Enter transaction ID"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Add any notes or comments"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Creating..." : "Create Payout"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Payout Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Payout</DialogTitle>
            <DialogDescription>
              Update payout information
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-reseller">Reseller Name / ID *</Label>
              <Input
                id="edit-reseller"
                value={formData.reseller}
                onChange={(e) =>
                  setFormData({ ...formData, reseller: e.target.value })
                }
                placeholder="Enter reseller name or ID"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-amount">Amount *</Label>
              <Input
                id="edit-amount"
                type="number"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                placeholder="Enter amount"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-method">Payment Method</Label>
              <Select
                value={formData.method}
                onValueChange={(value) =>
                  setFormData({ ...formData, method: value as Payout["method"] })
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
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value as Payout["status"] })
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
              <Label htmlFor="edit-transactionId">Transaction ID (Optional)</Label>
              <Input
                id="edit-transactionId"
                value={formData.transactionId}
                onChange={(e) =>
                  setFormData({ ...formData, transactionId: e.target.value })
                }
                placeholder="Enter transaction ID"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-notes">Notes (Optional)</Label>
              <Textarea
                id="edit-notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Add any notes or comments"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setSelectedPayout(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEdit}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Updating..." : "Update Payout"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Payout Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Payout Details</DialogTitle>
            <DialogDescription>
              View complete payout information
            </DialogDescription>
          </DialogHeader>
          {selectedPayout && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Payout ID</Label>
                  <p className="font-medium">{selectedPayout.payoutId}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">
                    <Badge
                      variant="outline"
                      className={
                        statusStyles[selectedPayout.status as keyof typeof statusStyles]
                      }
                    >
                      {selectedPayout.status}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Reseller</Label>
                  <p className="font-medium">{selectedPayout.reseller}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Amount</Label>
                  <p className="font-medium">
                    ₹{selectedPayout.amount.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Payment Method</Label>
                  <p className="font-medium">{selectedPayout.method}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Date</Label>
                  <p className="font-medium">
                    {new Date(selectedPayout.date).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              {selectedPayout.transactionId && (
                <div>
                  <Label className="text-muted-foreground">Transaction ID</Label>
                  <p className="font-medium">{selectedPayout.transactionId}</p>
                </div>
              )}
              {selectedPayout.notes && (
                <div>
                  <Label className="text-muted-foreground">Notes</Label>
                  <p className="text-sm">{selectedPayout.notes}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                <div>
                  <Label className="text-muted-foreground">Created At</Label>
                  <p>
                    {new Date(selectedPayout.createdAt).toLocaleString("en-IN")}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Updated At</Label>
                  <p>
                    {new Date(selectedPayout.updatedAt).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this payout? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          {selectedPayout && (
            <div className="py-4">
              <p className="text-sm">
                <span className="font-medium">Payout ID:</span>{" "}
                {selectedPayout.payoutId}
              </p>
              <p className="text-sm">
                <span className="font-medium">Reseller:</span>{" "}
                {selectedPayout.reseller}
              </p>
              <p className="text-sm">
                <span className="font-medium">Amount:</span> ₹
                {selectedPayout.amount.toLocaleString()}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedPayout(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
