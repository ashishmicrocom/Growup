import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Eye, EyeOff, Upload, X } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { getImageUrl } from "@/lib/imageUtils";
import {
  getAllRecognitionsAdmin,
  createRecognition,
  updateRecognition,
  deleteRecognition,
  toggleRecognitionStatus,
  type Recognition,
  type CreateRecognitionData,
  type RecognitionsResponse,
  type RecognitionResponse,
} from "@/services/recognitionService";

const Recognitions = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRecognition, setSelectedRecognition] = useState<Recognition | null>(null);
  const [deleteRecognitionId, setDeleteRecognitionId] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState<CreateRecognitionData>({
    name: "",
    logo: "",
    description: "",
    order: 0,
    externalLink: "",
    isActive: true,
  });

  // Fetch recognitions
  const { data: recognitionsData, isLoading } = useQuery<RecognitionsResponse>({
    queryKey: ["recognitions"],
    queryFn: getAllRecognitionsAdmin,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createRecognition,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recognitions"] });
      toast({
        title: "Success",
        description: "Recognition created successfully",
      });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create recognition",
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateRecognitionData> | FormData }) =>
      updateRecognition(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recognitions"] });
      toast({
        title: "Success",
        description: "Recognition updated successfully",
      });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update recognition",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation<RecognitionResponse, any, string>({
    mutationFn: deleteRecognition,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recognitions"] });
      toast({
        title: "Success",
        description: "Recognition deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      setDeleteRecognitionId(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete recognition",
        variant: "destructive",
      });
    },
  });

  // Toggle status mutation
  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateRecognition(id, { isActive: !isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recognitions"] });
      toast({
        title: "Success",
        description: "Status updated successfully",
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

  const handleOpenDialog = (recognition?: Recognition) => {
    if (recognition) {
      setSelectedRecognition(recognition);
      setFormData({
        name: recognition.name,
        logo: recognition.logo,
        description: recognition.description || "",
        order: recognition.order || 0,
        externalLink: recognition.externalLink || "",
        isActive: recognition.isActive ?? true,
      });
      setLogoPreview(getImageUrl(recognition.logo));
    } else {
      setSelectedRecognition(null);
      setFormData({
        name: "",
        logo: "",
        description: "",
        order: 0,
        externalLink: "",
        isActive: true,
      });
      setLogoPreview("");
    }
    setLogoFile(null);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedRecognition(null);
    setFormData({
      name: "",
      logo: "",
      description: "",
      order: 0,
      externalLink: "",
      isActive: true,
    });
    setLogoFile(null);
    setLogoPreview("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview("");
    setFormData({ ...formData, logo: "" });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || (!formData.logo && !logoFile)) {
      toast({
        title: "Error",
        description: "Name and logo are required",
        variant: "destructive",
      });
      return;
    }

    // Prepare data - use FormData if file is uploaded, otherwise use JSON
    let dataToSubmit: FormData | typeof formData;
    
    if (logoFile) {
      const formDataObj = new FormData();
      formDataObj.append('name', formData.name);
      formDataObj.append('logo', logoFile);
      formDataObj.append('description', formData.description || '');
      formDataObj.append('order', formData.order.toString());
      formDataObj.append('externalLink', formData.externalLink || '');
      formDataObj.append('isActive', formData.isActive.toString());
      dataToSubmit = formDataObj;
    } else {
      dataToSubmit = formData;
    }

    if (selectedRecognition) {
      updateMutation.mutate({
        id: selectedRecognition._id,
        data: dataToSubmit,
      });
    } else {
      createMutation.mutate(dataToSubmit);
    }
  };

  const handleDelete = () => {
    if (deleteRecognitionId) {
      deleteMutation.mutate(deleteRecognitionId);
    }
  };

  return (
    <AdminLayout title="Recognitions" subtitle="Manage company recognitions and logos">
      <div className="flex flex-col gap-6">
        {/* Add Recognition Button */}
        <div className="flex items-center justify-end">
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Recognition
          </Button>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground">Loading recognitions...</p>
            </div>
          ) : recognitionsData && recognitionsData.data.length > 0 ? (
            recognitionsData.data.map((recognition: Recognition) => (
              <Card key={recognition._id} className="flex flex-col">
                <CardContent className="flex-grow p-4">
                  {/* Logo Preview */}
                  <div className="mb-4 h-32 w-full bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                    {recognition.logo && (
                      <img
                        src={getImageUrl(recognition.logo)}
                        alt={recognition.name}
                        className="h-full w-full object-contain p-2"
                      />
                    )}
                  </div>

                  {/* Name */}
                  <h3 className="font-bold text-lg mb-2">{recognition.name}</h3>

                  {/* Description */}
                  {recognition.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {recognition.description}
                    </p>
                  )}

                  {/* External Link */}
                  {recognition.externalLink && (
                    <p className="text-xs text-blue-600 mb-3 truncate">
                      {recognition.externalLink}
                    </p>
                  )}

                  {/* Order */}
                  <p className="text-xs text-muted-foreground mb-3">
                    Order: {recognition.order}
                  </p>

                  {/* Status Badge */}
                  <Badge variant={recognition.isActive ? "default" : "secondary"} className="mb-4">
                    {recognition.isActive ? "Active" : "Inactive"}
                  </Badge>
                </CardContent>

                {/* Actions */}
                <div className="border-t p-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      toggleMutation.mutate({
                        id: recognition._id,
                        isActive: recognition.isActive,
                      })
                    }
                    disabled={toggleMutation.isPending}
                  >
                    {recognition.isActive ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDialog(recognition)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setDeleteRecognitionId(recognition._id);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground">No recognitions found</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedRecognition ? "Edit Recognition" : "Add Recognition"}
            </DialogTitle>
            <DialogDescription>
              {selectedRecognition
                ? "Update recognition details"
                : "Add a new recognition"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Recognition Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Startup India"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            {/* Logo Upload/URL */}
            <div className="space-y-2">
              <Label>Logo *</Label>
              <div className="space-y-3">
                {/* File Upload */}
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="logo-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload from Device
                  </Button>
                </div>

                {/* OR divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or use URL
                    </span>
                  </div>
                </div>

                {/* Logo URL */}
                <Input
                  id="logo"
                  placeholder="https://example.com/logo.png"
                  value={formData.logo}
                  onChange={(e) =>
                    setFormData({ ...formData, logo: e.target.value })
                  }
                  disabled={!!logoFile}
                />

                {/* Preview */}
                {(logoPreview || formData.logo) && (
                  <div className="relative mt-2 h-32 bg-muted rounded-lg flex items-center justify-center overflow-hidden border-2 border-border">
                    <img
                      src={logoPreview || getImageUrl(formData.logo)}
                      alt="Logo preview"
                      className="h-full w-full object-contain p-2"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "";
                      }}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8"
                      onClick={handleRemoveLogo}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the recognition"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>

            {/* External Link */}
            <div className="space-y-2">
              <Label htmlFor="externalLink">External Link</Label>
              <Input
                id="externalLink"
                placeholder="https://example.com"
                value={formData.externalLink}
                onChange={(e) =>
                  setFormData({ ...formData, externalLink: e.target.value })
                }
              />
            </div>

            {/* Order */}
            <div className="space-y-2">
              <Label htmlFor="order">Display Order</Label>
              <Input
                id="order"
                type="number"
                min="0"
                value={formData.order}
                onChange={(e) =>
                  setFormData({ ...formData, order: parseInt(e.target.value) || 0 })
                }
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  createMutation.isPending || updateMutation.isPending
                }
              >
                {createMutation.isPending || updateMutation.isPending
                  ? "Saving..."
                  : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Recognition</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this recognition? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default Recognitions;
