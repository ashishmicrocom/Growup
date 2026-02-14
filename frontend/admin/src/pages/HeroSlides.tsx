import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Eye, EyeOff, GripVertical, Upload, X } from "lucide-react";
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
import {
  getAllHeroSlides,
  createHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
  toggleHeroSlideStatus,
  type HeroSlide,
  type CreateHeroSlideData,
} from "@/services/heroSlideService";

const HeroSlides = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSlide, setSelectedSlide] = useState<HeroSlide | null>(null);
  const [deleteSlideId, setDeleteSlideId] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState<CreateHeroSlideData>({
    subtitle: "",
    text: "",
    description: "",
    image: "",
    ctaButtons: [{ text: "", link: "", variant: "secondary" }],
    features: [{ text: "", icon: "" }],
    order: 0,
    contentAlignment: "right",
    isActive: true,
  });

  // Fetch hero slides
  const { data: slidesData, isLoading } = useQuery({
    queryKey: ["heroSlides"],
    queryFn: getAllHeroSlides,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createHeroSlide,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["heroSlides"] });
      toast({
        title: "Success",
        description: "Hero slide created successfully",
      });
      handleCloseDialog();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create hero slide",
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateHeroSlideData }) =>
      updateHeroSlide(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["heroSlides"] });
      toast({
        title: "Success",
        description: "Hero slide updated successfully",
      });
      handleCloseDialog();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update hero slide",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteHeroSlide,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["heroSlides"] });
      toast({
        title: "Success",
        description: "Hero slide deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      setDeleteSlideId(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete hero slide",
        variant: "destructive",
      });
    },
  });

  // Toggle status mutation
  const toggleMutation = useMutation({
    mutationFn: toggleHeroSlideStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["heroSlides"] });
      toast({
        title: "Success",
        description: "Slide status updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update slide status",
        variant: "destructive",
      });
    },
  });

  const handleOpenDialog = (slide?: HeroSlide) => {
    if (slide) {
      setSelectedSlide(slide);
      setFormData({
        subtitle: slide.subtitle,
        text: slide.text,
        description: slide.description,
        image: slide.image,
        ctaButtons: slide.ctaButtons,
        features: slide.features,
        order: slide.order,
        contentAlignment: slide.contentAlignment,
        isActive: slide.isActive,
      });
      setImagePreview(slide.image);
    } else {
      setSelectedSlide(null);
      setFormData({
        subtitle: "",
        text: "",
        description: "",
        image: "",
        ctaButtons: [{ text: "", link: "", variant: "secondary" }],
        features: [{ text: "", icon: "" }],
        order: (slidesData?.data.length || 0) + 1,
        contentAlignment: "right",
        isActive: true,
      });
      setImagePreview("");
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedSlide(null);
    setImagePreview("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSlide) {
      updateMutation.mutate({ id: selectedSlide._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteSlideId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deleteSlideId) {
      deleteMutation.mutate(deleteSlideId);
    }
  };

  const handleToggleStatus = (id: string) => {
    toggleMutation.mutate(id);
  };

  const addCtaButton = () => {
    setFormData({
      ...formData,
      ctaButtons: [...formData.ctaButtons, { text: "", link: "", variant: "secondary" }],
    });
  };

  const removeCtaButton = (index: number) => {
    setFormData({
      ...formData,
      ctaButtons: formData.ctaButtons.filter((_, i) => i !== index),
    });
  };

  const updateCtaButton = (index: number, field: string, value: string) => {
    const updatedButtons = [...formData.ctaButtons];
    updatedButtons[index] = { ...updatedButtons[index], [field]: value };
    setFormData({ ...formData, ctaButtons: updatedButtons });
  };

  const addFeature = () => {
    setFormData({
      ...formData,
      features: [...formData.features, { text: "", icon: "" }],
    });
  };

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    });
  };

  const updateFeature = (index: number, field: string, value: string) => {
    const updatedFeatures = [...formData.features];
    updatedFeatures[index] = { ...updatedFeatures[index], [field]: value };
    setFormData({ ...formData, features: updatedFeatures });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Image size should be less than 5MB",
          variant: "destructive",
        });
        return;
      }

      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData({ ...formData, image: base64String });
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData({ ...formData, image: "" });
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <AdminLayout title="Hero Slides" subtitle="Manage homepage hero section slides">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Hero Slides</h1>
            <p className="text-muted-foreground">
              Manage homepage hero section slides
            </p>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Slide
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid gap-6">
            {slidesData?.data
              .sort((a, b) => a.order - b.order)
              .map((slide) => (
                <Card key={slide._id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <GripVertical className="h-6 w-6 text-muted-foreground mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle className="text-xl">
                              {slide.text.split('\n')[0]}
                            </CardTitle>
                            <Badge variant={slide.isActive ? "default" : "secondary"}>
                              {slide.isActive ? "Active" : "Inactive"}
                            </Badge>
                            <Badge variant="outline">Order: {slide.order}</Badge>
                          </div>
                          <CardDescription>{slide.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleStatus(slide._id)}
                        >
                          {slide.isActive ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(slide)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(slide._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <img
                          src={slide.image}
                          alt={slide.text}
                          className="rounded-lg w-full h-48 object-cover"
                        />
                      </div>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">CTA Buttons</h4>
                          <div className="space-y-2">
                            {slide.ctaButtons.map((btn, idx) => (
                              <div key={idx} className="text-sm">
                                <Badge variant="outline">{btn.text}</Badge>
                                <span className="text-muted-foreground ml-2">→ {btn.link}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Features</h4>
                          <div className="flex flex-wrap gap-2">
                            {slide.features.map((feat, idx) => (
                              <Badge key={idx} variant="secondary">
                                {feat.text}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedSlide ? "Edit Hero Slide" : "Create Hero Slide"}
              </DialogTitle>
              <DialogDescription>
                {selectedSlide
                  ? "Update the hero slide details"
                  : "Add a new hero slide to the homepage"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="subtitle">Subtitle</Label>
                  <Input
                    id="subtitle"
                    value={formData.subtitle}
                    onChange={(e) =>
                      setFormData({ ...formData, subtitle: e.target.value })
                    }
                    placeholder="Optional subtitle"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="text">Main Text *</Label>
                  <Textarea
                    id="text"
                    value={formData.text}
                    onChange={(e) =>
                      setFormData({ ...formData, text: e.target.value })
                    }
                    placeholder="Main heading (use \n for line breaks)"
                    required
                    rows={3}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Brief description"
                    required
                    rows={2}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="image">Image *</Label>
                  <div className="space-y-2">
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={removeImage}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Input
                          id="image"
                          value={formData.image}
                          onChange={(e) => {
                            setFormData({ ...formData, image: e.target.value });
                            setImagePreview(e.target.value);
                          }}
                          placeholder="/src/assets/hero images/slide1.png or paste URL"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload
                        </Button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Upload an image (max 5MB) or enter an image URL
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="order">Order</Label>
                    <Input
                      id="order"
                      type="number"
                      value={formData.order}
                      onChange={(e) =>
                        setFormData({ ...formData, order: parseInt(e.target.value) })
                      }
                      min={0}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="contentAlignment">Content Position</Label>
                    <select
                      id="contentAlignment"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={formData.contentAlignment}
                      onChange={(e) =>
                        setFormData({ ...formData, contentAlignment: e.target.value as 'left' | 'right' })
                      }
                    >
                      <option value="left">Left</option>
                      <option value="right">Right</option>
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="isActive">Status</Label>
                    <select
                      id="isActive"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={formData.isActive ? "true" : "false"}
                      onChange={(e) =>
                        setFormData({ ...formData, isActive: e.target.value === "true" })
                      }
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>CTA Buttons</Label>
                    <Button type="button" size="sm" onClick={addCtaButton}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Button
                    </Button>
                  </div>
                  {formData.ctaButtons.map((btn, idx) => (
                    <div key={idx} className="grid grid-cols-3 gap-2 p-3 border rounded-lg">
                      <Input
                        placeholder="Button Text"
                        value={btn.text}
                        onChange={(e) => updateCtaButton(idx, "text", e.target.value)}
                        required
                      />
                      <Input
                        placeholder="Link"
                        value={btn.link}
                        onChange={(e) => updateCtaButton(idx, "link", e.target.value)}
                        required
                      />
                      <div className="flex gap-2">
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          value={btn.variant}
                          onChange={(e) => updateCtaButton(idx, "variant", e.target.value)}
                        >
                          <option value="default">Default</option>
                          <option value="secondary">Secondary</option>
                          <option value="outline">Outline</option>
                        </select>
                        {formData.ctaButtons.length > 1 && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => removeCtaButton(idx)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Features */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Features</Label>
                    <Button type="button" size="sm" onClick={addFeature}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Feature
                    </Button>
                  </div>
                  {formData.features.map((feat, idx) => (
                    <div key={idx} className="grid grid-cols-2 gap-2 p-3 border rounded-lg">
                      <Input
                        placeholder="Feature Text"
                        value={feat.text}
                        onChange={(e) => updateFeature(idx, "text", e.target.value)}
                        required
                      />
                      <div className="flex gap-2">
                        <Input
                          placeholder="Icon (e.g., package, users, truck)"
                          value={feat.icon}
                          onChange={(e) => updateFeature(idx, "icon", e.target.value)}
                          required
                        />
                        {formData.features.length > 1 && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => removeFeature(idx)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button type="submit">
                  {selectedSlide ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the hero slide.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
};

export default HeroSlides;
