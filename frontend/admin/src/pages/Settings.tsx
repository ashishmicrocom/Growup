import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings as SettingsIcon,
  CreditCard,
  Bell,
  Shield,
  Percent,
  Building,
  Save,
} from "lucide-react";

export default function Settings() {
  return (
    <AdminLayout title="Settings" subtitle="Configure platform settings">
      <div className="max-w-4xl">
        <Tabs defaultValue="platform" className="space-y-6">
          <TabsList className="bg-muted p-1 h-auto flex-wrap">
            <TabsTrigger value="platform" className="gap-2">
              <SettingsIcon className="h-4 w-4" />
              Platform
            </TabsTrigger>
            <TabsTrigger value="commission" className="gap-2">
              <Percent className="h-4 w-4" />
              Commission
            </TabsTrigger>
            <TabsTrigger value="payment" className="gap-2">
              <CreditCard className="h-4 w-4" />
              Payment
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
          </TabsList>

          {/* Platform Settings */}
          <TabsContent value="platform">
            <div className="admin-card p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Platform Settings</h3>
                <p className="text-sm text-muted-foreground">
                  Configure general platform settings and business information
                </p>
              </div>
              <Separator />

              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="business-name">Business Name</Label>
                  <Input id="business-name" defaultValue="Flourisel" />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="contact-email">Contact Email</Label>
                  <Input id="contact-email" type="email" defaultValue="support@Flourisel.in" />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="contact-phone">Contact Phone</Label>
                  <Input id="contact-phone" type="tel" defaultValue="+91 98765 43210" />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="address">Business Address</Label>
                  <Input id="address" defaultValue="Mumbai, Maharashtra, India" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Temporarily disable the platform for maintenance
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>

              <Separator />
              <div className="flex justify-end">
                <Button className="bg-primary hover:bg-primary/90">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Commission Settings */}
          <TabsContent value="commission">
            <div className="admin-card p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Commission Settings</h3>
                <p className="text-sm text-muted-foreground">
                  Configure reseller commission rates and payout rules
                </p>
              </div>
              <Separator />

              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="default-commission">Default Commission Rate (%)</Label>
                  <Input id="default-commission" type="number" defaultValue="10" />
                  <p className="text-xs text-muted-foreground">
                    Applied to products without custom commission
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="min-payout">Minimum Payout Amount (₹)</Label>
                  <Input id="min-payout" type="number" defaultValue="500" />
                  <p className="text-xs text-muted-foreground">
                    Minimum balance required for payout request
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="payout-cycle">Payout Cycle (Days)</Label>
                  <Input id="payout-cycle" type="number" defaultValue="7" />
                  <p className="text-xs text-muted-foreground">
                    Days after order completion before commission becomes available
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Automatic Payouts</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically process payouts on schedule
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <Separator />
              <div className="flex justify-end">
                <Button className="bg-primary hover:bg-primary/90">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Payment Settings */}
          <TabsContent value="payment">
            <div className="admin-card p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Payment Settings</h3>
                <p className="text-sm text-muted-foreground">
                  Configure payment gateways and payout methods
                </p>
              </div>
              <Separator />

              <div className="grid gap-6">
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <CreditCard className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Razorpay</p>
                      <p className="text-sm text-muted-foreground">Accept online payments</p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center">
                      <Building className="h-6 w-6 text-success" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Bank Transfer</p>
                      <p className="text-sm text-muted-foreground">Enable IMPS/NEFT payouts</p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="gst">GST Number</Label>
                  <Input id="gst" defaultValue="27XXXXX1234X1Z5" />
                </div>
              </div>

              <Separator />
              <div className="flex justify-end">
                <Button className="bg-primary hover:bg-primary/90">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Notifications Settings */}
          <TabsContent value="notifications">
            <div className="admin-card p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  Notification Settings
                </h3>
                <p className="text-sm text-muted-foreground">
                  Configure email and push notification preferences
                </p>
              </div>
              <Separator />

              <div className="space-y-4">
                {[
                  {
                    title: "New Order Notifications",
                    description: "Get notified when a new order is placed",
                  },
                  {
                    title: "New User Registrations",
                    description: "Get notified when a new user signs up",
                  },
                  {
                    title: "Payout Requests",
                    description: "Get notified when a reseller requests payout",
                  },
                  {
                    title: "Low Stock Alerts",
                    description: "Get notified when product stock is low",
                  },
                  {
                    title: "Daily Summary",
                    description: "Receive daily business summary email",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="flex items-center justify-between p-4 border border-border rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-foreground">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                ))}
              </div>

              <Separator />
              <div className="flex justify-end">
                <Button className="bg-primary hover:bg-primary/90">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security">
            <div className="admin-card p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Security Settings</h3>
                <p className="text-sm text-muted-foreground">
                  Configure security and access control settings
                </p>
              </div>
              <Separator />

              <div className="grid gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Require 2FA for admin login
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Session Timeout</Label>
                    <p className="text-sm text-muted-foreground">
                      Auto logout after inactivity
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="session-duration">Session Duration (minutes)</Label>
                  <Input id="session-duration" type="number" defaultValue="60" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Login Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Email alert on new device login
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <Separator />
              <div className="flex justify-end gap-3">
                <Button variant="outline">Reset Password</Button>
                <Button className="bg-primary hover:bg-primary/90">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
