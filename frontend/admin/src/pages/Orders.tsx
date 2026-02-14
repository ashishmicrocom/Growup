import { AdminLayout } from "@/components/layout/AdminLayout";
import { DataTable } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Eye, MoreVertical, Download, ShoppingCart } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllOrders, updateOrderStatus, deleteOrder, type Order } from "@/services/orderService";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const paymentStyles = {
  paid: "status-active",
  pending: "status-pending",
  failed: "status-blocked",
};

const orderStatusStyles = {
  processing: "bg-info/10 text-info border-info/20",
  ready_to_ship: "bg-purple-100 text-purple-700 border-purple-200",
  shipped: "bg-accent/20 text-accent-foreground border-accent/20",
  delivered: "status-active",
  cancelled: "status-blocked",
};

export default function Orders() {
  const [filters, setFilters] = useState<{ orderStatus?: string; paymentStatus?: string; search?: string }>({});
  const [viewDialog, setViewDialog] = useState<Order | null>(null);
  const [statusDialog, setStatusDialog] = useState<Order | null>(null);
  const [cancelDialog, setCancelDialog] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch orders from backend
  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['orders', filters],
    queryFn: () => getAllOrders(filters),
  });

  const orders = ordersData?.data || [];
  const totalOrders = ordersData?.total || 0;

  // Update order status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({
        title: "Success",
        description: "Order status updated successfully",
      });
      setStatusDialog(null);
      setNewStatus("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update order status",
        variant: "destructive",
      });
    },
  });

  // Delete order mutation
  const deleteOrderMutation = useMutation({
    mutationFn: (id: string) => deleteOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({
        title: "Success",
        description: "Order cancelled successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to cancel order",
        variant: "destructive",
      });
    },
  });

  // Handle filter change
  const handleFilterChange = (value: string) => {
    if (value === "all") {
      setFilters({ ...filters, orderStatus: undefined });
    } else {
      setFilters({ ...filters, orderStatus: value });
    }
  };

  // Handle export
  const handleExport = () => {
    if (orders.length === 0) {
      toast({
        title: "No Data",
        description: "There are no orders to export",
        variant: "destructive",
      });
      return;
    }

    // Create CSV content
    const headers = ["Order ID", "Customer", "Product", "Amount", "Reseller", "Payment Status", "Order Status", "Date"];
    const csvRows = [
      headers.join(","),
      ...orders.map(order => [
        order.orderId,
        `"${order.customer}"`,
        `"${order.product}"`,
        order.amount,
        `"${order.reseller}"`,
        order.paymentStatus,
        order.orderStatus,
        order.date
      ].join(","))
    ];

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `orders_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Success",
      description: `Exported ${orders.length} orders`,
    });
  };

  // Handle print invoice
  const handlePrintInvoice = (order: Order) => {
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${order.orderId}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .details { margin-bottom: 20px; }
            .details table { width: 100%; border-collapse: collapse; }
            .details td { padding: 8px; border-bottom: 1px solid #ddd; }
            .details td:first-child { font-weight: bold; width: 150px; }
            .total { font-size: 20px; font-weight: bold; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>INVOICE</h1>
            <p>Order ID: ${order.orderId}</p>
            <p>Date: ${order.date}</p>
          </div>
          <div class="details">
            <table>
              <tr><td>Customer:</td><td>${order.customer}</td></tr>
              <tr><td>Product:</td><td>${order.product}</td></tr>
              <tr><td>Reseller:</td><td>${order.reseller}</td></tr>
              <tr><td>Payment Status:</td><td>${order.paymentStatus}</td></tr>
              <tr><td>Order Status:</td><td>${order.orderStatus}</td></tr>
            </table>
          </div>
          <div class="total">
            Total Amount: ₹${order.amount.toLocaleString()}
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const columns = [
    {
      key: "orderId",
      label: "Order ID",
      render: (order: Order) => (
        <span className="font-medium text-primary">{order.orderId}</span>
      ),
    },
    {
      key: "customer",
      label: "Customer",
      render: (order: Order) => (
        <span className="text-foreground">{order.customer}</span>
      ),
    },
    {
      key: "product",
      label: "Product",
      render: (order: Order) => (
        <span className="text-muted-foreground">{order.product}</span>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      render: (order: Order) => (
        <span className="font-medium text-foreground">₹{order.amount.toLocaleString()}</span>
      ),
    },
    {
      key: "reseller",
      label: "Reseller",
      render: (order: Order) => (
        <span className="text-muted-foreground">{order.reseller}</span>
      ),
    },
    {
      key: "paymentStatus",
      label: "Payment",
      render: (order: Order) => (
        <Badge variant="outline" className={cn("capitalize", paymentStyles[order.paymentStatus])}>
          {order.paymentStatus}
        </Badge>
      ),
    },
    {
      key: "orderStatus",
      label: "Status",
      render: (order: Order) => (
        <Badge variant="outline" className={cn("capitalize", orderStatusStyles[order.orderStatus])}>
          {order.orderStatus}
        </Badge>
      ),
    },
    {
      key: "date",
      label: "Date",
      render: (order: Order) => (
        <span className="text-sm text-muted-foreground">{order.date}</span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (order: Order) => (
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => setViewDialog(order)}
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
              <DropdownMenuItem onClick={() => setViewDialog(order)}>
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                setStatusDialog(order);
                setNewStatus(order.orderStatus);
              }}>
                Update Status
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePrintInvoice(order)}>
                Print Invoice
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive"
                onClick={() => setCancelDialog(order)}
              >
                Cancel Order
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout title="Orders" subtitle="Track and manage all orders">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-muted">
              <ShoppingCart className="h-3 w-3 mr-1" />
              Total: {isLoading ? '...' : totalOrders}
            </Badge>
            <Badge variant="outline" className="bg-info/10 text-info border-info/20">
              Processing: {isLoading ? '...' : orders.filter((o) => o.orderStatus === "processing").length}
            </Badge>
            <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200">
              Ready to Ship: {isLoading ? '...' : orders.filter((o) => o.orderStatus === "ready_to_ship").length}
            </Badge>
            <Badge variant="outline" className="status-active">
              Delivered: {isLoading ? '...' : orders.filter((o) => o.orderStatus === "delivered").length}
            </Badge>
          </div>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Data Table */}
        <DataTable
          data={orders}
          columns={columns}
          searchPlaceholder="Search orders..."
          searchKey="orderId"
          filterOptions={[
            { label: "Processing", value: "processing" },
            { label: "Ready to Ship", value: "ready_to_ship" },
            { label: "Shipped", value: "shipped" },
            { label: "Delivered", value: "delivered" },
            { label: "Cancelled", value: "cancelled" },
          ]}
          onFilterChange={handleFilterChange}
        />

        {/* View Details Dialog */}
        <Dialog open={!!viewDialog} onOpenChange={() => setViewDialog(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Order Details</DialogTitle>
              <DialogDescription>
                Order ID: {viewDialog?.orderId}
              </DialogDescription>
            </DialogHeader>
            {viewDialog && (
              <div className="space-y-6">
                {/* Order Status and Payment */}
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Order Status</p>
                    <Badge variant="outline" className={cn("capitalize", orderStatusStyles[viewDialog.orderStatus])}>
                      {viewDialog.orderStatus.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Payment Status</p>
                    <Badge variant="outline" className={cn("capitalize", paymentStyles[viewDialog.paymentStatus])}>
                      {viewDialog.paymentStatus}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Order Date</p>
                    <p className="text-sm font-semibold">{viewDialog.date}</p>
                  </div>
                </div>

                {/* Products Details */}
                {viewDialog.items && viewDialog.items.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg border-b pb-2">Order Items</h3>
                    {viewDialog.items.map((item, index) => (
                      <div key={index} className="flex gap-4 p-4 border rounded-lg bg-white">
                        {/* Product Image */}
                        <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={
                              item.product?.image?.startsWith('http') || item.product?.image?.startsWith('/uploads')
                                ? item.product.image.startsWith('http')
                                  ? item.product.image
                                  : `http://localhost:7777${item.product.image}`
                                : item.product?.image || '/placeholder.png'
                            }
                            alt={item.productName}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        
                        {/* Product Details */}
                        <div className="flex-1 space-y-2">
                          <div>
                            <h4 className="font-semibold text-sm">{item.productName}</h4>
                            {item.product?.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                {item.product.description}
                              </p>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Price: </span>
                              <span className="font-medium">₹{item.price.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Quantity: </span>
                              <span className="font-medium">{item.quantity}</span>
                            </div>
                            {item.product?.originalPrice && item.product.originalPrice > item.price && (
                              <div>
                                <span className="text-muted-foreground">MRP: </span>
                                <span className="line-through text-xs">₹{item.product.originalPrice.toLocaleString()}</span>
                              </div>
                            )}
                            <div>
                              <span className="text-muted-foreground">Subtotal: </span>
                              <span className="font-semibold text-primary">₹{(item.price * item.quantity).toLocaleString()}</span>
                            </div>
                          </div>
                          
                          <div className="pt-2 border-t">
                            <span className="text-xs text-muted-foreground">Reseller Earning: </span>
                            <span className="text-sm font-semibold text-green-600">₹{item.resellerEarning}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2 p-4 border rounded-lg">
                    <p className="text-sm font-medium text-muted-foreground">Product</p>
                    <p className="text-sm font-semibold">{viewDialog.product}</p>
                  </div>
                )}

                {/* Shipping Address */}
                {viewDialog.shippingAddress && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg border-b pb-2">Shipping Address</h3>
                    <div className="p-4 bg-muted/30 rounded-lg space-y-1 text-sm">
                      <p className="font-semibold">{viewDialog.shippingAddress.name}</p>
                      <p>{viewDialog.shippingAddress.address}</p>
                      <p>{viewDialog.shippingAddress.city}, {viewDialog.shippingAddress.state} - {viewDialog.shippingAddress.pincode}</p>
                      <p className="pt-2 text-muted-foreground">Phone: {viewDialog.shippingAddress.phone}</p>
                      {viewDialog.shippingAddress.email && (
                        <p className="text-muted-foreground">Email: {viewDialog.shippingAddress.email}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Customer & Reseller Info */}
                <div className="grid grid-cols-2 gap-4">
                  {viewDialog.user ? (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Customer</p>
                      <p className="text-sm font-semibold">{viewDialog.user.firstName} {viewDialog.user.lastName}</p>
                      <p className="text-xs text-muted-foreground">{viewDialog.user.email}</p>
                      <p className="text-xs text-muted-foreground">{viewDialog.user.mobile}</p>
                    </div>
                  ) : viewDialog.customer && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Customer</p>
                      <p className="text-sm font-semibold">{viewDialog.customer}</p>
                    </div>
                  )}
                  
                  {viewDialog.reseller && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Reseller</p>
                      <p className="text-sm font-semibold">{viewDialog.reseller}</p>
                    </div>
                  )}
                </div>

                {/* Order Summary */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total Amount</span>
                    <span className="text-primary">
                      ₹{(viewDialog.totalAmount || viewDialog.amount).toLocaleString()}
                    </span>
                  </div>
                  {viewDialog.totalEarnings && (
                    <div className="flex justify-between items-center text-sm text-green-600 mt-2">
                      <span>Total Reseller Earnings</span>
                      <span className="font-semibold">₹{viewDialog.totalEarnings.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewDialog(null)}>
                Close
              </Button>
              <Button onClick={() => viewDialog && handlePrintInvoice(viewDialog)}>
                Print Invoice
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Update Status Dialog */}
        <Dialog open={!!statusDialog} onOpenChange={() => {
          setStatusDialog(null);
          setNewStatus("");
        }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Update Order Status</DialogTitle>
              <DialogDescription>
                Update status for order {statusDialog?.orderId}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="status">Order Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="ready_to_ship">Ready to Ship</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setStatusDialog(null);
                  setNewStatus("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (statusDialog && newStatus) {
                    updateStatusMutation.mutate({ 
                      id: statusDialog._id, 
                      status: newStatus 
                    });
                  }
                }}
                disabled={!newStatus || updateStatusMutation.isPending}
              >
                {updateStatusMutation.isPending ? "Updating..." : "Update"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Cancel Order Confirmation Dialog */}
        <Dialog open={!!cancelDialog} onOpenChange={() => setCancelDialog(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Cancel Order</DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel order {cancelDialog?.orderId}?
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                This action cannot be undone. The order will be permanently cancelled.
              </p>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setCancelDialog(null)}
              >
                No, Keep Order
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (cancelDialog) {
                    deleteOrderMutation.mutate(cancelDialog._id);
                    setCancelDialog(null);
                  }
                }}
                disabled={deleteOrderMutation.isPending}
              >
                {deleteOrderMutation.isPending ? "Cancelling..." : "Yes, Cancel Order"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
