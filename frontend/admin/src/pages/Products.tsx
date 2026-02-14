import React from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { DataTable } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Edit, MoreVertical, Plus, Package, FolderPlus, Upload, X } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getAllProducts, 
  toggleProductStatus, 
  deleteProduct,
  updateProductStock,
  type Product,
  type CreateProductData,
  type UpdateProductData
} from "@/services/productService";
import { 
  getAllCategories, 
  createCategory,
  updateCategory,
  deleteCategory,
  type CreateCategoryData,
  type UpdateCategoryData,
  type Category
} from "@/services/categoryService";
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

export default function Products() {
  const [filters, setFilters] = useState<{ category?: string; stock?: string; search?: string }>({});
  const [addDialog, setAddDialog] = useState(false);
  const [categoryDialog, setCategoryDialog] = useState(false);
  const [editCategoryDialog, setEditCategoryDialog] = useState<Category | null>(null);
  const [deleteCategoryDialog, setDeleteCategoryDialog] = useState<Category | null>(null);
  const [editDialog, setEditDialog] = useState<Product | null>(null);
  const [viewDialog, setViewDialog] = useState<Product | null>(null);
  const [stockDialog, setStockDialog] = useState<Product | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<Product | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedGalleryFiles, setSelectedGalleryFiles] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<any>({
    name: "",
    category: "",
    price: 0,
    commission: 0,
    image: "📦",
    stock: "in_stock",
    active: true,
    stockQuantity: 0,
    originalPrice: 0,
    description: "",
    brand: "Wooh's",
    tags: [],
    weight: "1 kg",
    dimensions: "25 × 15 × 10 cm",
    type: "Organic",
    mfgDate: "Jun 4, 2021",
    lifespan: "30 days",
    features: [],
    images: [],
    sizes: [],
    colors: []
  });
  const [categoryFormData, setCategoryFormData] = useState<CreateCategoryData>({
    name: "",
    description: "",
    parentCategory: null,
    active: true
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch products from backend
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', filters],
    queryFn: () => getAllProducts(filters),
  });

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getAllCategories(),
  });

  const products = productsData?.data || [];
  const totalProducts = productsData?.total || 0;
  const categories = categoriesData?.data || [];

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: (data: CreateCategoryData) => createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: "Success",
        description: "Category created successfully",
      });
      setCategoryDialog(false);
      setCategoryFormData({
        name: "",
        description: "",
        parentCategory: null,
        active: true
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create category",
        variant: "destructive",
      });
    },
  });

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryData }) => updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: "Success",
        description: "Category updated successfully",
      });
      setEditCategoryDialog(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update category",
        variant: "destructive",
      });
    },
  });

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
      setDeleteCategoryDialog(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete category",
        variant: "destructive",
      });
    },
  });

  // Create product mutation with file upload
  const createProductMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await api.post('/products', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: "Success",
        description: "Product created successfully",
      });
      setAddDialog(false);
      setSelectedFile(null);
      setImagePreview("");
      setFormData({
        name: "",
        category: "",
        price: 0,
        commission: 0,
        image: "📦",
        stock: "in_stock",
        active: true,
        stockQuantity: 0,
        originalPrice: 0,
        description: "",
        brand: "Wooh's",
        tags: [],
        weight: "1 kg",
        dimensions: "25 × 15 × 10 cm",
        type: "Organic",
        mfgDate: "Jun 4, 2021",
        lifespan: "30 days",
        features: [],
        images: []
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create product",
        variant: "destructive",
      });
    },
  });

  // Update product mutation with file upload
  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FormData }) => {
      const response = await api.put(`/products/${id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
      setEditDialog(null);
      setSelectedFile(null);
      setImagePreview("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update product",
        variant: "destructive",
      });
    },
  });

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setSelectedGalleryFiles(prev => [...prev, ...files]);
      
      // Generate previews for new files
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setGalleryPreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeGalleryImage = (index: number) => {
    setSelectedGalleryFiles(prev => prev.filter((_, i) => i !== index));
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Handle create product with form data
  const handleCreateProduct = () => {
    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('category', formData.category);
    formDataToSend.append('price', formData.price.toString());
    formDataToSend.append('commission', formData.commission.toString());
    formDataToSend.append('stock', formData.stock || 'in_stock');
    formDataToSend.append('active', (formData.active !== undefined ? formData.active : true).toString());
    formDataToSend.append('stockQuantity', (formData.stockQuantity || 0).toString());
    
    if (formData.description) {
      formDataToSend.append('description', formData.description);
    }
    
    if (formData.originalPrice) {
      formDataToSend.append('originalPrice', formData.originalPrice.toString());
    }
    
    if (formData.brand) {
      formDataToSend.append('brand', formData.brand);
    }
    
    if (formData.tags) {
      const tagsArray = typeof formData.tags === 'string' 
        ? (formData.tags as string).split(',').map(t => t.trim()).filter(t => t)
        : formData.tags;
      if (tagsArray.length > 0) {
        formDataToSend.append('tags', JSON.stringify(tagsArray));
      }
    }
    
    if (formData.weight) {
      formDataToSend.append('weight', formData.weight);
    }
    
    if (formData.dimensions) {
      formDataToSend.append('dimensions', formData.dimensions);
    }
    
    if (formData.type) {
      formDataToSend.append('type', formData.type);
    }
    
    if (formData.mfgDate) {
      formDataToSend.append('mfgDate', formData.mfgDate);
    }
    
    if (formData.lifespan) {
      formDataToSend.append('lifespan', formData.lifespan);
    }
    
    if (formData.features) {
      const featuresArray = typeof formData.features === 'string'
        ? (formData.features as string).split(',').map(f => f.trim()).filter(f => f)
        : formData.features;
      if (featuresArray.length > 0) {
        formDataToSend.append('features', JSON.stringify(featuresArray));
      }
    }
    
    // Handle main product image
    if (selectedFile) {
      formDataToSend.append('image', selectedFile);
    } else if (formData.image) {
      formDataToSend.append('image', formData.image);
    }

    // Handle gallery images
    if (selectedGalleryFiles && selectedGalleryFiles.length > 0) {
      selectedGalleryFiles.forEach(file => {
        formDataToSend.append('images', file);
      });
    }

    // Handle sizes
    if (formData.sizes && formData.sizes.length > 0) {
      formDataToSend.append('sizes', JSON.stringify(formData.sizes));
    }

    // Handle colors
    if (formData.colors && formData.colors.length > 0) {
      formDataToSend.append('colors', JSON.stringify(formData.colors));
    }

    createProductMutation.mutate(formDataToSend);
  };

  // Handle update product with form data
  const handleUpdateProduct = () => {
    if (!editDialog) return;

    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('category', formData.category);
    formDataToSend.append('price', formData.price.toString());
    formDataToSend.append('commission', formData.commission.toString());
    formDataToSend.append('stock', formData.stock || 'in_stock');
    formDataToSend.append('active', (formData.active !== undefined ? formData.active : true).toString());
    formDataToSend.append('stockQuantity', (formData.stockQuantity || 0).toString());
    
    if (formData.description) {
      formDataToSend.append('description', formData.description);
    }
    
    if (formData.originalPrice) {
      formDataToSend.append('originalPrice', formData.originalPrice.toString());
    }
    
    if (formData.brand) {
      formDataToSend.append('brand', formData.brand);
    }
    
    if (formData.tags) {
      const tagsArray = typeof formData.tags === 'string' 
        ? (formData.tags as string).split(',').map(t => t.trim()).filter(t => t)
        : formData.tags;
      if (tagsArray.length > 0) {
        formDataToSend.append('tags', JSON.stringify(tagsArray));
      }
    }
    
    if (formData.weight) {
      formDataToSend.append('weight', formData.weight);
    }
    
    if (formData.dimensions) {
      formDataToSend.append('dimensions', formData.dimensions);
    }
    
    if (formData.type) {
      formDataToSend.append('type', formData.type);
    }
    
    if (formData.mfgDate) {
      formDataToSend.append('mfgDate', formData.mfgDate);
    }
    
    if (formData.lifespan) {
      formDataToSend.append('lifespan', formData.lifespan);
    }
    
    if (formData.features) {
      const featuresArray = typeof formData.features === 'string'
        ? (formData.features as string).split(',').map(f => f.trim()).filter(f => f)
        : formData.features;
      if (featuresArray.length > 0) {
        formDataToSend.append('features', JSON.stringify(featuresArray));
      }
    }
    
    // Handle main product image
    if (selectedFile) {
      formDataToSend.append('image', selectedFile);
    } else if (formData.image) {
      formDataToSend.append('image', formData.image);
    }

    // Handle gallery images
    if (selectedGalleryFiles && selectedGalleryFiles.length > 0) {
      selectedGalleryFiles.forEach(file => {
        formDataToSend.append('images', file);
      });
    }

    // Handle sizes
    if (formData.sizes && formData.sizes.length > 0) {
      formDataToSend.append('sizes', JSON.stringify(formData.sizes));
    }

    // Handle colors
    if (formData.colors && formData.colors.length > 0) {
      formDataToSend.append('colors', JSON.stringify(formData.colors));
    }

    updateProductMutation.mutate({ id: editDialog._id, data: formDataToSend });
  };

  // Toggle product status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: (id: string) => toggleProductStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: "Success",
        description: "Product status updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update product status",
        variant: "destructive",
      });
    },
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
      setDeleteDialog(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete product",
        variant: "destructive",
      });
    },
  });

  // Update stock mutation
  const updateStockMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { stock?: string; stockQuantity?: number } }) => 
      updateProductStock(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: "Success",
        description: "Stock updated successfully",
      });
      setStockDialog(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update stock",
        variant: "destructive",
      });
    },
  });

  // Handle filter change
  const handleFilterChange = (value: string) => {
    if (value === "all") {
      setFilters({ ...filters, category: undefined });
    } else {
      setFilters({ ...filters, category: value });
    }
  };

  const stockStyles = {
    in_stock: "status-active",
    low_stock: "status-pending",
    out_of_stock: "status-blocked",
  };

  const stockLabels = {
    in_stock: "In Stock",
    low_stock: "Low Stock",
    out_of_stock: "Out of Stock",
  };

  const columns = [
      {
        key: "product",
        label: "Product",
        render: (product: Product) => (
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center text-2xl overflow-hidden">
              {product.image?.startsWith('http') || product.image?.startsWith('/uploads') ? (
                <img src={product.image.startsWith('http') ? product.image : `http://localhost:7777${product.image}`} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <span>{product.image}</span>
              )}
            </div>
            <div>
              <p className="font-medium text-foreground">{product.name}</p>
              <p className="text-sm text-muted-foreground">{product.productId}</p>
            </div>
          </div>
        ),
      },
      {
        key: "category",
        label: "Category",
        render: (product: Product) => (
          <Badge variant="outline" className="bg-muted">
            {product.category}
          </Badge>
        ),
      },
      {
        key: "price",
        label: "Price",
        render: (product: Product) => (
          <span className="font-medium text-foreground">₹{product.price.toLocaleString()}</span>
        ),
      },
      // {
      //   key: "commission",
      //   label: "Commission",
      //   render: (product: Product) => (
      //     <span className="font-medium text-success">₹{product.commission}</span>
      //   ),
      // },
      {
        key: "stock",
        label: "Stock",
        render: (product: Product) => (
          <Badge variant="outline" className={cn(stockStyles[product.stock])}>
            {stockLabels[product.stock]}
          </Badge>
        ),
      },
      {
        key: "active",
        label: "Status",
        render: (product: Product) => (
          <Switch
            checked={product.active}
            onCheckedChange={() => toggleStatusMutation.mutate(product._id)}
            disabled={toggleStatusMutation.isPending}
          />
        ),
      },
      {
        key: "actions",
        label: "Actions",
        render: (product: Product) => (
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => {
                setFormData({
                  name: product.name,
                  category: product.category,
                  price: product.price,
                  // commission: product.commission,
                  image: product.image,
                  stock: product.stock,
                  active: product.active,
                  stockQuantity: product.stockQuantity,
                  description: product.description
                });
                setEditDialog(product);
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => {
                  setFormData({
                    name: product.name,
                    category: product.category,
                    price: product.price,
                    // commission: product.commission,
                    image: product.image,
                    stock: product.stock,
                    active: product.active,
                    stockQuantity: product.stockQuantity,
                    description: product.description
                  });
                  setEditDialog(product);
                }}>
                  Edit Product
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setViewDialog(product)}>
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStockDialog(product)}>
                  Update Stock
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => setDeleteDialog(product)}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ];

    return (
      <AdminLayout title="Products" subtitle="Manage your product catalog">
        <div className="space-y-6">
          {/* Header Actions */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-muted">
                <Package className="h-3 w-3 mr-1" />
                Total: {isLoading ? '...' : totalProducts}
              </Badge>
              <Badge variant="outline" className="status-active">
                Active: {isLoading ? '...' : products.filter((p) => p.active).length}
              </Badge>
              <Badge variant="outline" className="status-pending">
                Low Stock: {isLoading ? '...' : products.filter((p) => p.stock === "low_stock").length}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => {
                  setCategoryFormData({
                    name: "",
                    description: "",
                    parentCategory: null,
                    active: true
                  });
                  setCategoryDialog(true);
                }}
              >
                <FolderPlus className="h-4 w-4 mr-2" />
                New Category
              </Button>
              <Button 
                className="bg-primary hover:bg-primary/90"
                onClick={() => {
                  setFormData({
                    name: "",
                    category: "",
                    price: 0,
                    commission: 0,
                    image: "📦",
                    stock: "in_stock",
                    active: true,
                    stockQuantity: 0
                  });
                  setSelectedFile(null);
                  setImagePreview("");
                  setAddDialog(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>
          </div>

          {/* Data Table */}
          <DataTable
            data={products}
            columns={columns}
            searchPlaceholder="Search products..."
            searchKey="name"
            filterOptions={categories.map(cat => ({ label: cat.name, value: cat.name }))}
            onFilterChange={handleFilterChange}
          />

          {/* Create Category Dialog */}
          <Dialog open={categoryDialog} onOpenChange={setCategoryDialog}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Manage Categories</DialogTitle>
                <DialogDescription>
                  Create, edit, and delete product categories
                </DialogDescription>
              </DialogHeader>
              
              {/* Existing Categories Table */}
              {categories.length > 0 && (
                <div className="border rounded-lg overflow-hidden mb-4">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-3 text-sm font-medium">Category</th>
                        <th className="text-left p-3 text-sm font-medium">Type</th>
                        <th className="text-left p-3 text-sm font-medium">Description</th>
                        <th className="text-right p-3 text-sm font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {categories.filter(cat => !cat.parentCategory).map((parentCat) => (
                        <React.Fragment key={parentCat._id}>
                          {/* Parent Category */}
                          <tr className="hover:bg-muted/50 bg-blue-50/50">
                            <td className="p-3 font-semibold text-blue-900">{parentCat.name}</td>
                            <td className="p-3">
                              <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">Parent</span>
                            </td>
                            <td className="p-3 text-sm text-muted-foreground truncate max-w-xs">
                              {parentCat.description || '-'}
                            </td>
                            <td className="p-3">
                              <div className="flex gap-2 justify-end">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setCategoryFormData({
                                      name: parentCat.name,
                                      description: parentCat.description || '',
                                      parentCategory: null,
                                      active: parentCat.active
                                    });
                                    setEditCategoryDialog(parentCat);
                                  }}
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => setDeleteCategoryDialog(parentCat)}
                                >
                                  Delete
                                </Button>
                              </div>
                            </td>
                          </tr>
                          {/* Subcategories */}
                          {parentCat.subcategories && parentCat.subcategories.length > 0 && parentCat.subcategories.map((subcat: any) => (
                            <tr key={subcat._id} className="hover:bg-muted/50">
                              <td className="p-3 pl-8 text-sm">
                                <span className="text-muted-foreground mr-2">↳</span>
                                {subcat.name}
                              </td>
                              <td className="p-3">
                                <span className="text-xs bg-gray-400 text-white px-2 py-1 rounded">Subcategory</span>
                              </td>
                              <td className="p-3 text-sm text-muted-foreground truncate max-w-xs">
                                {subcat.description || '-'}
                              </td>
                              <td className="p-3">
                                <div className="flex gap-2 justify-end">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setCategoryFormData({
                                        name: subcat.name,
                                        description: subcat.description || '',
                                        parentCategory: parentCat._id,
                                        active: subcat.active
                                      });
                                      setEditCategoryDialog(subcat);
                                    }}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => setDeleteCategoryDialog(subcat)}
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </React.Fragment>
                      ))}
                      {/* Standalone Subcategories (orphaned) */}
                      {categories.filter(cat => cat.parentCategory && typeof cat.parentCategory === 'string').map((cat) => (
                        <tr key={cat._id} className="hover:bg-muted/50 bg-yellow-50/50">
                          <td className="p-3 pl-8 text-sm">
                            <span className="text-muted-foreground mr-2">↳</span>
                            {cat.name}
                          </td>
                          <td className="p-3">
                            <span className="text-xs bg-yellow-600 text-white px-2 py-1 rounded">Orphaned</span>
                          </td>
                          <td className="p-3 text-sm text-muted-foreground truncate max-w-xs">
                            {cat.description || '-'}
                          </td>
                          <td className="p-3">
                            <div className="flex gap-2 justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setCategoryFormData({
                                    name: cat.name,
                                    description: cat.description || '',
                                    parentCategory: typeof cat.parentCategory === 'object' ? cat.parentCategory?._id || null : cat.parentCategory || null,
                                    active: cat.active
                                  });
                                  setEditCategoryDialog(cat);
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setDeleteCategoryDialog(cat)}
                              >
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Add New Category Form */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-4">Add New Category</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="category-name">Category Name</Label>
                    <Input
                      id="category-name"
                      value={categoryFormData.name}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                      placeholder="Enter category name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category-parent">Parent Category (Optional)</Label>
                    <Select 
                      value={categoryFormData.parentCategory || "none"} 
                      onValueChange={(value) => setCategoryFormData({ ...categoryFormData, parentCategory: value === "none" ? null : value })}
                    >
                      <SelectTrigger id="category-parent">
                        <SelectValue placeholder="Select parent category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Parent (Top-level Category)</SelectItem>
                        {categories.filter(cat => !cat.parentCategory).map((cat) => (
                          <SelectItem key={cat._id} value={cat._id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category-description">Description (Optional)</Label>
                    <Textarea
                      id="category-description"
                      value={categoryFormData.description}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                      placeholder="Category description"
                      rows={2}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCategoryDialog(false)}>
                  Close
                </Button>
                <Button
                  onClick={() => createCategoryMutation.mutate(categoryFormData)}
                  disabled={createCategoryMutation.isPending || !categoryFormData.name}
                >
                  {createCategoryMutation.isPending ? "Creating..." : "Add Category"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Add Product Dialog */}
          <Dialog open={addDialog} onOpenChange={setAddDialog}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>
                  Create a new product in your catalog
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-6 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter product name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Product Image</Label>
                  <div className="flex gap-2">
                    <Input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {selectedFile ? selectedFile.name : "Upload Image"}
                    </Button>
                    {selectedFile && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedFile(null);
                          setImagePreview("");
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {imagePreview && (
                    <div className="mt-2 h-32 w-32 rounded-lg overflow-hidden border">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  {/* {!selectedFile && (
                    <div className="space-y-2 mt-2">
                      <Label htmlFor="image">Or use Emoji Icon</Label>
                      <Input
                        id="image"
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        placeholder="📦"
                      />
                    </div>
                  )} */}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.filter(cat => !cat.parentCategory).map((cat) => (
                        <React.Fragment key={cat._id}>
                          <SelectItem value={cat.name}>
                            {cat.name}
                          </SelectItem>
                          {cat.subcategories && cat.subcategories.length > 0 && cat.subcategories.map((subcat: any) => (
                            <SelectItem key={subcat._id} value={subcat.name} className="pl-8">
                              ↳ {subcat.name}
                            </SelectItem>
                          ))}
                        </React.Fragment>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">MRP Price (₹)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price || ''}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value ? parseFloat(e.target.value) : 0 })}
                    placeholder="Enter price"
                  />
                </div>
                {/* <div className="space-y-2">
                  <Label htmlFor="commission">Commission (₹)</Label>
                  <Input
                    id="commission"
                    type="number"
                    value={formData.commission || ''}
                    onChange={(e) => setFormData({ ...formData, commission: e.target.value ? parseFloat(e.target.value) : 0 })}
                    placeholder="Enter commission"
                  />
                </div> */}
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock Status</Label>
                  <Select 
                    value={formData.stock} 
                    onValueChange={(value: any) => setFormData({ ...formData, stock: value })}
                  >
                    <SelectTrigger id="stock">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in_stock">In Stock</SelectItem>
                      <SelectItem value="low_stock">Low Stock</SelectItem>
                      <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stockQuantity">Quantity</Label>
                  <Input
                    id="stockQuantity"
                    type="number"
                    value={formData.stockQuantity || ''}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value ? parseInt(e.target.value) : 0 })}
                    placeholder="Enter quantity"
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Product description"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="originalPrice">Selling Price (₹)</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    value={formData.originalPrice || ''}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value ? parseFloat(e.target.value) : 0 })}
                    placeholder="Enter original price"
                  />
                  <p className="text-xs text-muted-foreground">For displaying discounts</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    value={formData.brand || ''}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="Wooh's"
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    value={typeof formData.tags === 'string' ? formData.tags : (Array.isArray(formData.tags) ? formData.tags.join(', ') : '')}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value as any })}
                    placeholder="chicken, natural, organic"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight</Label>
                  <Input
                    id="weight"
                    value={formData.weight || ''}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    placeholder="1 kg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dimensions">Dimensions</Label>
                  <Input
                    id="dimensions"
                    value={formData.dimensions || ''}
                    onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                    placeholder="25 × 15 × 10 cm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Input
                    id="type"
                    value={formData.type || ''}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    placeholder="Organic"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lifespan">Lifespan</Label>
                  <Input
                    id="lifespan"
                    value={formData.lifespan || ''}
                    onChange={(e) => setFormData({ ...formData, lifespan: e.target.value })}
                    placeholder="30 days"
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="mfgDate">Manufacturing Date</Label>
                  <Input
                    id="mfgDate"
                    value={formData.mfgDate || ''}
                    onChange={(e) => setFormData({ ...formData, mfgDate: e.target.value })}
                    placeholder="Jun 4, 2021"
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="features">Features (comma separated)</Label>
                  <Textarea
                    id="features"
                    value={typeof formData.features === 'string' ? formData.features : (Array.isArray(formData.features) ? formData.features.join(', ') : '')}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value as any })}
                    placeholder="Type: Organic, MFG: Jun 4 2021, LIFE: 30 days"
                    rows={2}
                  />
                </div>

                {/* Gallery Images Section */}
                <div className="col-span-2 space-y-2">
                  <Label>Gallery Images (Optional)</Label>
                  <div className="flex gap-2">
                    <Input
                      type="file"
                      ref={galleryFileInputRef}
                      onChange={handleGalleryFilesChange}
                      accept="image/*"
                      multiple
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => galleryFileInputRef.current?.click()}
                      className="flex-1"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Add Gallery Images (Max 10)
                    </Button>
                  </div>
                  {galleryPreviews.length > 0 && (
                    <div className="grid grid-cols-5 gap-2 mt-2">
                      {galleryPreviews.map((preview, index) => (
                        <div key={index} className="relative h-24 rounded-lg overflow-hidden border">
                          <img src={preview} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6"
                            onClick={() => removeGalleryImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sizes Section */}
                <div className="col-span-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Product Sizes (Optional)</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          sizes: [...(formData.sizes || []), { size: '', measurement: '', inStock: true }]
                        });
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Size
                    </Button>
                  </div>
                  {formData.sizes && formData.sizes.length > 0 && (
                    <div className="space-y-2">
                      {formData.sizes.map((sizeItem: any, index: number) => (
                        <div key={index} className="flex gap-2 items-start p-3 border rounded-lg">
                          <div className="flex-1">
                            <Input
                              placeholder="Size (e.g., S, M, L, XL)"
                              value={sizeItem.size || ''}
                              onChange={(e) => {
                                const newSizes = [...formData.sizes];
                                newSizes[index] = { ...newSizes[index], size: e.target.value };
                                setFormData({ ...formData, sizes: newSizes });
                              }}
                            />
                          </div>
                          <div className="flex-1">
                            <Input
                              placeholder="Measurement (e.g., 38-40 inches)"
                              value={sizeItem.measurement || ''}
                              onChange={(e) => {
                                const newSizes = [...formData.sizes];
                                newSizes[index] = { ...newSizes[index], measurement: e.target.value };
                                setFormData({ ...formData, sizes: newSizes });
                              }}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={sizeItem.inStock !== false}
                              onChange={(e) => {
                                const newSizes = [...formData.sizes];
                                newSizes[index] = { ...newSizes[index], inStock: e.target.checked };
                                setFormData({ ...formData, sizes: newSizes });
                              }}
                              className="h-4 w-4"
                            />
                            <span className="text-sm">In Stock</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const newSizes = formData.sizes.filter((_: any, i: number) => i !== index);
                              setFormData({ ...formData, sizes: newSizes });
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Colors Section */}
                <div className="col-span-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Product Colors (Optional)</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          colors: [...(formData.colors || []), { name: '', hexCode: '#000000', inStock: true }]
                        });
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Color
                    </Button>
                  </div>
                  {formData.colors && formData.colors.length > 0 && (
                    <div className="space-y-2">
                      {formData.colors.map((colorItem: any, index: number) => (
                        <div key={index} className="flex gap-2 items-start p-3 border rounded-lg">
                          <div className="flex-1">
                            <Input
                              placeholder="Color Name (e.g., Red, Blue)"
                              value={colorItem.name || ''}
                              onChange={(e) => {
                                const newColors = [...formData.colors];
                                newColors[index] = { ...newColors[index], name: e.target.value };
                                setFormData({ ...formData, colors: newColors });
                              }}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={colorItem.hexCode || '#000000'}
                              onChange={(e) => {
                                const newColors = [...formData.colors];
                                newColors[index] = { ...newColors[index], hexCode: e.target.value };
                                setFormData({ ...formData, colors: newColors });
                              }}
                              className="h-10 w-16 rounded border cursor-pointer"
                            />
                            <span className="text-xs text-muted-foreground">{colorItem.hexCode}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={colorItem.inStock !== false}
                              onChange={(e) => {
                                const newColors = [...formData.colors];
                                newColors[index] = { ...newColors[index], inStock: e.target.checked };
                                setFormData({ ...formData, colors: newColors });
                              }}
                              className="h-4 w-4"
                            />
                            <span className="text-sm">In Stock</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const newColors = formData.colors.filter((_: any, i: number) => i !== index);
                              setFormData({ ...formData, colors: newColors });
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddDialog(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateProduct}
                  disabled={createProductMutation.isPending || !formData.name || !formData.category}
                >
                  {createProductMutation.isPending ? "Creating..." : "Create Product"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Product Dialog */}
          <Dialog open={!!editDialog} onOpenChange={() => setEditDialog(null)}>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Product</DialogTitle>
                <DialogDescription>
                  Update product details
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Product Name</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Product Image</Label>
                  <div className="flex gap-2">
                    <Input
                      type="file"
                      ref={editFileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => editFileInputRef.current?.click()}
                      className="flex-1"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {selectedFile ? selectedFile.name : "Upload New Image"}
                    </Button>
                    {selectedFile && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedFile(null);
                          setImagePreview("");
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {imagePreview && (
                    <div className="mt-2 h-32 w-32 rounded-lg overflow-hidden border">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  {!selectedFile && (
                    <div className="space-y-2 mt-2">
                      <Label htmlFor="edit-image">Or use Emoji Icon</Label>
                      <Input
                        id="edit-image"
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Category</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger id="edit-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.filter(cat => !cat.parentCategory).map((cat) => (
                        <React.Fragment key={cat._id}>
                          <SelectItem value={cat.name}>
                            {cat.name}
                          </SelectItem>
                          {cat.subcategories && cat.subcategories.length > 0 && cat.subcategories.map((subcat: any) => (
                            <SelectItem key={subcat._id} value={subcat.name} className="pl-8">
                              ↳ {subcat.name}
                            </SelectItem>
                          ))}
                        </React.Fragment>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-price">Price (₹)</Label>
                    <Input
                      id="edit-price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-commission">Commission (₹)</Label>
                    <Input
                      id="edit-commission"
                      type="number"
                      value={formData.commission}
                      onChange={(e) => setFormData({ ...formData, commission: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description (Optional)</Label>
                  <Textarea
                    id="edit-description"
                    value={formData.description || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditDialog(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateProduct}
                  disabled={updateProductMutation.isPending}
                >
                  {updateProductMutation.isPending ? "Updating..." : "Update Product"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* View Details Dialog */}
          <Dialog open={!!viewDialog} onOpenChange={() => setViewDialog(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Product Details</DialogTitle>
                <DialogDescription>
                  {viewDialog?.productId}
                </DialogDescription>
              </DialogHeader>
              {viewDialog && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center text-4xl overflow-hidden">
                      {viewDialog.image?.startsWith('http') || viewDialog.image?.startsWith('/uploads') ? (
                        <img src={viewDialog.image.startsWith('http') ? viewDialog.image : `http://localhost:7777${viewDialog.image}`} alt={viewDialog.name} className="w-full h-full object-cover" />
                      ) : (
                        <span>{viewDialog.image}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{viewDialog.name}</h3>
                      <Badge variant="outline" className="mt-1">{viewDialog.category}</Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Price</p>
                      <p className="text-lg font-semibold">₹{viewDialog.price.toLocaleString()}</p>
                    </div>
                    {/* <div>
                      <p className="text-sm font-medium text-muted-foreground">Commission</p>
                      <p className="text-lg font-semibold text-success">₹{viewDialog.commission}</p>
                    </div> */}
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Stock Status</p>
                      <Badge variant="outline" className={cn(stockStyles[viewDialog.stock])}>
                        {stockLabels[viewDialog.stock]}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Quantity</p>
                      <p className="text-lg font-semibold">{viewDialog.stockQuantity}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-muted-foreground">Status</p>
                      <Badge variant="outline" className={viewDialog.active ? "status-active" : "status-blocked"}>
                        {viewDialog.active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    {viewDialog.description && (
                      <div className="col-span-2">
                        <p className="text-sm font-medium text-muted-foreground">Description</p>
                        <p className="text-sm mt-1">{viewDialog.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setViewDialog(null)}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Update Stock Dialog */}
          <Dialog open={!!stockDialog} onOpenChange={() => setStockDialog(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Update Stock</DialogTitle>
                <DialogDescription>
                  Update stock status and quantity for {stockDialog?.name}
                </DialogDescription>
              </DialogHeader>
              {stockDialog && (
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="stock-status">Stock Status</Label>
                    <Select 
                      defaultValue={stockDialog.stock}
                      onValueChange={(value) => setFormData({ ...formData, stock: value as any })}
                    >
                      <SelectTrigger id="stock-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in_stock">In Stock</SelectItem>
                        <SelectItem value="low_stock">Low Stock</SelectItem>
                        <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock-qty">Stock Quantity</Label>
                    <Input
                      id="stock-qty"
                      type="number"
                      defaultValue={stockDialog.stockQuantity}
                      onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setStockDialog(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (stockDialog) {
                      updateStockMutation.mutate({ 
                        id: stockDialog._id, 
                        data: { 
                          stock: formData.stock, 
                          stockQuantity: formData.stockQuantity 
                        } 
                      });
                    }
                  }}
                  disabled={updateStockMutation.isPending}
                >
                  {updateStockMutation.isPending ? "Updating..." : "Update Stock"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Delete Product</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete {deleteDialog?.name}?
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p className="text-sm text-muted-foreground">
                  This action cannot be undone. The product will be permanently removed from your catalog.
                </p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteDialog(null)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (deleteDialog) {
                      deleteProductMutation.mutate(deleteDialog._id);
                    }
                  }}
                  disabled={deleteProductMutation.isPending}
                >
                  {deleteProductMutation.isPending ? "Deleting..." : "Delete Product"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Category Dialog */}
          <Dialog open={!!editCategoryDialog} onOpenChange={() => setEditCategoryDialog(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Category</DialogTitle>
                <DialogDescription>
                  Update category details
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-category-name">Category Name</Label>
                  <Input
                    id="edit-category-name"
                    value={categoryFormData.name}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                    placeholder="Enter category name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-category-parent">Parent Category (Optional)</Label>
                  <Select 
                    value={categoryFormData.parentCategory || "none"} 
                    onValueChange={(value) => setCategoryFormData({ ...categoryFormData, parentCategory: value === "none" ? null : value })}
                  >
                    <SelectTrigger id="edit-category-parent">
                      <SelectValue placeholder="Select parent category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Parent (Top-level Category)</SelectItem>
                      {categories.filter(cat => !cat.parentCategory && cat._id !== editCategoryDialog?._id).map((cat) => (
                        <SelectItem key={cat._id} value={cat._id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-category-description">Description (Optional)</Label>
                  <Textarea
                    id="edit-category-description"
                    value={categoryFormData.description}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                    placeholder="Category description"
                    rows={2}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditCategoryDialog(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (editCategoryDialog) {
                      updateCategoryMutation.mutate({ 
                        id: editCategoryDialog._id, 
                        data: categoryFormData 
                      });
                    }
                  }}
                  disabled={updateCategoryMutation.isPending || !categoryFormData.name}
                >
                  {updateCategoryMutation.isPending ? "Updating..." : "Update Category"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Category Confirmation Dialog */}
          <Dialog open={!!deleteCategoryDialog} onOpenChange={() => setDeleteCategoryDialog(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Delete Category</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete "{deleteCategoryDialog?.name}"?
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p className="text-sm text-muted-foreground">
                  This action cannot be undone. The category will be permanently removed.
                  {deleteCategoryDialog?.subcategories && deleteCategoryDialog.subcategories.length > 0 && (
                    <span className="block mt-2 text-destructive font-medium">
                      Warning: This category has {deleteCategoryDialog.subcategories.length} subcategory(ies) that must be deleted first.
                    </span>
                  )}
                </p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteCategoryDialog(null)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (deleteCategoryDialog) {
                      deleteCategoryMutation.mutate(deleteCategoryDialog._id);
                    }
                  }}
                  disabled={deleteCategoryMutation.isPending}
                >
                  {deleteCategoryMutation.isPending ? "Deleting..." : "Delete Category"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </AdminLayout>
    );
}