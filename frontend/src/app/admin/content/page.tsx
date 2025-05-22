"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertCircle, 
  ArrowDown, 
  ArrowUp, 
  CheckCircle, 
  Edit, 
  Eye, 
  Image as ImageIcon, 
  Loader2, 
  Plus, 
  Save, 
  Trash, 
  Upload,
  Settings
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

interface Banner {
  _id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  position: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface HomepageSection {
  _id: string;
  title: string;
  type: string;
  position: number;
  isActive: boolean;
  config: {
    itemCount?: number;
    categoryId?: string;
    productIds?: string[];
    merchantIds?: string[];
    showTitle?: boolean;
    viewAllLink?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function AdminContentPage() {
  const { toast } = useToast();
  
  // State for tabs
  const [activeTab, setActiveTab] = useState("banners");
  
  // State for banners
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isBannersLoading, setIsBannersLoading] = useState(true);
  const [bannersError, setBannersError] = useState<string | null>(null);
  
  // State for homepage sections
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [isSectionsLoading, setIsSectionsLoading] = useState(true);
  const [sectionsError, setSectionsError] = useState<string | null>(null);
  
  // State for banner form
  const [isBannerDialogOpen, setIsBannerDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [bannerFormData, setBannerFormData] = useState({
    title: '',
    subtitle: '',
    imageUrl: '',
    linkUrl: '',
    isActive: true,
    startDate: '',
    endDate: ''
  });
  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null);
  const [bannerImagePreview, setBannerImagePreview] = useState<string | null>(null);
  
  // State for section form
  const [isSectionDialogOpen, setIsSectionDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<HomepageSection | null>(null);
  const [sectionFormData, setSectionFormData] = useState<{
    title: string;
    type: string;
    isActive: boolean;
    config: {
      itemCount?: number;
      showTitle?: boolean;
      viewAllLink?: string;
      categoryId?: string;
      productIds?: string[];
      merchantIds?: string[];
    };
  }>({
    title: '',
    type: 'featured-products',
    isActive: true,
    config: {
      itemCount: 8,
      showTitle: true,
      viewAllLink: '',
      categoryId: '',
      productIds: [],
      merchantIds: []
    }
  });
  
  // State for saving changes
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Fetch banners and sections
  useEffect(() => {
    fetchBanners();
    fetchSections();
  }, []);
  
  const fetchBanners = async () => {
    try {
      setIsBannersLoading(true);
      setBannersError(null);
      
      // This endpoint needs to be implemented in the backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/content/banners`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch banners");
      }
      
      const data = await response.json();
      setBanners(data.banners.sort((a: Banner, b: Banner) => a.position - b.position));
    } catch (err: any) {
      console.error("Error fetching banners:", err);
      setBannersError(err.message || "Failed to load banners. Please try again later.");
    } finally {
      setIsBannersLoading(false);
    }
  };
  
  const fetchSections = async () => {
    try {
      setIsSectionsLoading(true);
      setSectionsError(null);
      
      // This endpoint needs to be implemented in the backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/content/homepage-sections`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch homepage sections");
      }
      
      const data = await response.json();
      setSections(data.sections.sort((a: HomepageSection, b: HomepageSection) => a.position - b.position));
    } catch (err: any) {
      console.error("Error fetching homepage sections:", err);
      setSectionsError(err.message || "Failed to load homepage sections. Please try again later.");
    } finally {
      setIsSectionsLoading(false);
    }
  };
  
  // Banner functions
  const handleAddBanner = () => {
    setEditingBanner(null);
    setBannerFormData({
      title: '',
      subtitle: '',
      imageUrl: '',
      linkUrl: '',
      isActive: true,
      startDate: '',
      endDate: ''
    });
    setBannerImageFile(null);
    setBannerImagePreview(null);
    setIsBannerDialogOpen(true);
  };
  
  const handleEditBanner = (banner: Banner) => {
    setEditingBanner(banner);
    setBannerFormData({
      title: banner.title,
      subtitle: banner.subtitle || '',
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl || '',
      isActive: banner.isActive,
      startDate: banner.startDate ? new Date(banner.startDate).toISOString().split('T')[0] : '',
      endDate: banner.endDate ? new Date(banner.endDate).toISOString().split('T')[0] : ''
    });
    setBannerImageFile(null);
    setBannerImagePreview(banner.imageUrl);
    setIsBannerDialogOpen(true);
  };
  
  const handleDeleteBanner = async (bannerId: string) => {
    if (!confirm("Are you sure you want to delete this banner? This action cannot be undone.")) {
      return;
    }
    
    try {
      // This endpoint needs to be implemented in the backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/content/banners/${bannerId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete banner");
      }
      
      // Remove banner from state
      setBanners(prev => {
        const filtered = prev.filter(banner => banner._id !== bannerId);
        // Reorder positions
        return filtered.map((banner, index) => ({
          ...banner,
          position: index + 1
        }));
      });
      
      toast({
        title: "Banner deleted",
        description: "The banner has been deleted successfully."
      });
      
      setHasChanges(true);
    } catch (err: any) {
      console.error("Error deleting banner:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to delete banner."
      });
    }
  };
  
  const handleBannerImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setBannerImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setBannerImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  const handleBannerFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      
      // Upload image if there's a new one
      let imageUrl = bannerFormData.imageUrl;
      if (bannerImageFile) {
        const formData = new FormData();
        formData.append('image', bannerImageFile);
        
        // This endpoint needs to be implemented in the backend
        const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/upload`, {
          method: 'POST',
          body: formData,
          credentials: 'include'
        });
        
        if (!uploadResponse.ok) {
          throw new Error("Failed to upload banner image");
        }
        
        const uploadData = await uploadResponse.json();
        imageUrl = uploadData.imageUrl;
      }
      
      const bannerData = {
        ...bannerFormData,
        imageUrl
      };
      
      const isEditing = !!editingBanner;
      const url = isEditing 
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/content/banners/${editingBanner._id}`
        : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/content/banners`;
      
      const method = isEditing ? 'PUT' : 'POST';
      
      // This endpoint needs to be implemented in the backend
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bannerData),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${isEditing ? 'update' : 'create'} banner`);
      }
      
      const data = await response.json();
      
      if (isEditing) {
        // Update banner in state
        setBanners(prev => 
          prev.map(banner => 
            banner._id === editingBanner._id ? data.banner : banner
          )
        );
        
        toast({
          title: "Banner updated",
          description: "The banner has been updated successfully."
        });
      } else {
        // Add new banner to state
        setBanners(prev => [...prev, data.banner].sort((a, b) => a.position - b.position));
        
        toast({
          title: "Banner created",
          description: "The banner has been created successfully."
        });
      }
      
      setIsBannerDialogOpen(false);
      setHasChanges(true);
    } catch (err: any) {
      console.error(`Error ${editingBanner ? 'updating' : 'creating'} banner:`, err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || `Failed to ${editingBanner ? 'update' : 'create'} banner.`
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleToggleBannerStatus = (bannerId: string, isActive: boolean) => {
    setBanners(prev => 
      prev.map(banner => 
        banner._id === bannerId ? { ...banner, isActive } : banner
      )
    );
    setHasChanges(true);
  };
  
  const handleMoveBanner = (bannerId: string, direction: 'up' | 'down') => {
    setBanners(prev => {
      const index = prev.findIndex(banner => banner._id === bannerId);
      if (index === -1) return prev;
      
      const newBanners = [...prev];
      
      if (direction === 'up' && index > 0) {
        // Swap with the previous item
        [newBanners[index - 1], newBanners[index]] = [newBanners[index], newBanners[index - 1]];
      } else if (direction === 'down' && index < newBanners.length - 1) {
        // Swap with the next item
        [newBanners[index], newBanners[index + 1]] = [newBanners[index + 1], newBanners[index]];
      }
      
      // Update positions
      return newBanners.map((banner, i) => ({
        ...banner,
        position: i + 1
      }));
    });
    
    setHasChanges(true);
  };
  
  // Section functions
  const handleAddSection = () => {
    setEditingSection(null);
    setSectionFormData({
      title: '',
      type: 'featured-products',
      isActive: true,
      config: {
        itemCount: 8,
        showTitle: true,
        viewAllLink: '',
        categoryId: '',
        productIds: [],
        merchantIds: []
      }
    });
    setIsSectionDialogOpen(true);
  };
  
  const handleEditSection = (section: HomepageSection) => {
    setEditingSection(section);
    setSectionFormData({
      title: section.title,
      type: section.type,
      isActive: section.isActive,
      config: {
        itemCount: section.config.itemCount || 8,
        showTitle: section.config.showTitle !== false,
        viewAllLink: section.config.viewAllLink || '',
        categoryId: section.config.categoryId || '',
        productIds: section.config.productIds || [],
        merchantIds: section.config.merchantIds || []
      }
    });
    setIsSectionDialogOpen(true);
  };
  
  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm("Are you sure you want to delete this section? This action cannot be undone.")) {
      return;
    }
    
    try {
      // This endpoint needs to be implemented in the backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/content/homepage-sections/${sectionId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete section");
      }
      
      // Remove section from state
      setSections(prev => {
        const filtered = prev.filter(section => section._id !== sectionId);
        // Reorder positions
        return filtered.map((section, index) => ({
          ...section,
          position: index + 1
        }));
      });
      
      toast({
        title: "Section deleted",
        description: "The homepage section has been deleted successfully."
      });
      
      setHasChanges(true);
    } catch (err: any) {
      console.error("Error deleting section:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to delete section."
      });
    }
  };
  
  const handleSectionFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      
      const isEditing = !!editingSection;
      const url = isEditing 
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/content/homepage-sections/${editingSection._id}`
        : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/content/homepage-sections`;
      
      const method = isEditing ? 'PUT' : 'POST';
      
      // This endpoint needs to be implemented in the backend
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sectionFormData),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${isEditing ? 'update' : 'create'} section`);
      }
      
      const data = await response.json();
      
      if (isEditing) {
        // Update section in state
        setSections(prev => 
          prev.map(section => 
            section._id === editingSection._id ? data.section : section
          )
        );
        
        toast({
          title: "Section updated",
          description: "The homepage section has been updated successfully."
        });
      } else {
        // Add new section to state
        setSections(prev => [...prev, data.section].sort((a, b) => a.position - b.position));
        
        toast({
          title: "Section created",
          description: "The homepage section has been created successfully."
        });
      }
      
      setIsSectionDialogOpen(false);
      setHasChanges(true);
    } catch (err: any) {
      console.error(`Error ${editingSection ? 'updating' : 'creating'} section:`, err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || `Failed to ${editingSection ? 'update' : 'create'} section.`
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleToggleSectionStatus = (sectionId: string, isActive: boolean) => {
    setSections(prev => 
      prev.map(section => 
        section._id === sectionId ? { ...section, isActive } : section
      )
    );
    setHasChanges(true);
  };
  
  const handleMoveSection = (sectionId: string, direction: 'up' | 'down') => {
    setSections(prev => {
      const index = prev.findIndex(section => section._id === sectionId);
      if (index === -1) return prev;
      
      const newSections = [...prev];
      
      if (direction === 'up' && index > 0) {
        // Swap with the previous item
        [newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]];
      } else if (direction === 'down' && index < newSections.length - 1) {
        // Swap with the next item
        [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
      }
      
      // Update positions
      return newSections.map((section, i) => ({
        ...section,
        position: i + 1
      }));
    });
    
    setHasChanges(true);
  };
  
  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);
      
      // Save banner positions
      const bannerPositions = banners.map((banner, index) => ({
        id: banner._id,
        position: index + 1,
        isActive: banner.isActive
      }));
      
      // Save section positions
      const sectionPositions = sections.map((section, index) => ({
        id: section._id,
        position: index + 1,
        isActive: section.isActive
      }));
      
      // This endpoint needs to be implemented in the backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/content/save-layout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          banners: bannerPositions,
          sections: sectionPositions
        }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error("Failed to save layout changes");
      }
      
      toast({
        title: "Changes saved",
        description: "Your layout changes have been saved successfully."
      });
      
      setHasChanges(false);
    } catch (err: any) {
      console.error("Error saving layout changes:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to save layout changes."
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle drag and drop for sections
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    
    if (sourceIndex === destinationIndex) return;
    
    if (result.type === 'banner') {
      setBanners(prev => {
        const newBanners = Array.from(prev);
        const [removed] = newBanners.splice(sourceIndex, 1);
        newBanners.splice(destinationIndex, 0, removed);
        
        // Update positions
        return newBanners.map((banner, index) => ({
          ...banner,
          position: index + 1
        }));
      });
    } else if (result.type === 'section') {
      setSections(prev => {
        const newSections = Array.from(prev);
        const [removed] = newSections.splice(sourceIndex, 1);
        newSections.splice(destinationIndex, 0, removed);
        
        // Update positions
        return newSections.map((section, index) => ({
          ...section,
          position: index + 1
        }));
      });
    }
    
    setHasChanges(true);
  };
  
  const getSectionTypeLabel = (type: string) => {
    switch (type) {
      case 'featured-products':
        return 'Featured Products';
      case 'category-products':
        return 'Category Products';
      case 'new-arrivals':
        return 'New Arrivals';
      case 'best-sellers':
        return 'Best Sellers';
      case 'featured-merchants':
        return 'Featured Merchants';
      case 'custom-products':
        return 'Custom Products Selection';
      default:
        return type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
  };
  
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Content Management</h1>
          <div className="flex gap-2">
            {hasChanges && (
              <Button onClick={handleSaveChanges} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Layout Changes
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="banners">Banners</TabsTrigger>
            <TabsTrigger value="homepage">Homepage Layout</TabsTrigger>
          </TabsList>
          
          <TabsContent value="banners" className="space-y-6 mt-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Banner Management</h2>
              <Button onClick={handleAddBanner}>
                <Plus className="mr-2 h-4 w-4" />
                Add Banner
              </Button>
            </div>
            
            {isBannersLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              </div>
            ) : bannersError ? (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <p className="text-sm text-red-700">{bannersError}</p>
                </div>
              </div>
            ) : banners.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <ImageIcon className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No Banners</h3>
                  <p className="text-gray-500 mb-4 text-center max-w-md">
                    Banners are displayed at the top of your homepage and help promote special offers or featured content.
                  </p>
                  <Button onClick={handleAddBanner}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Banner
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="banners" type="banner">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-4"
                    >
                      {banners.map((banner, index) => (
                        <Draggable key={banner._id} draggableId={banner._id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="border rounded-lg overflow-hidden bg-white"
                            >
                              <div className="flex flex-col md:flex-row">
                                <div className="w-full md:w-1/3 h-48 relative">
                                  {banner.imageUrl ? (
                                    <img 
                                      src={banner.imageUrl} 
                                      alt={banner.title} 
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                      <ImageIcon className="h-12 w-12 text-gray-400" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 p-4">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h3 className="text-lg font-medium">{banner.title}</h3>
                                      {banner.subtitle && (
                                        <p className="text-gray-500 mt-1">{banner.subtitle}</p>
                                      )}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Switch
                                        id={`toggle-${banner._id}`}
                                        checked={banner.isActive}
                                        onCheckedChange={(checked) => handleToggleBannerStatus(banner._id, checked)}
                                      />
                                      <Label htmlFor={`toggle-${banner._id}`}>
                                        {banner.isActive ? 'Active' : 'Inactive'}
                                      </Label>
                                    </div>
                                  </div>
                                  
                                  <div className="mt-4 text-sm text-gray-500">
                                    {banner.linkUrl && (
                                      <div className="mb-1">
                                        <strong>Link:</strong> {banner.linkUrl}
                                      </div>
                                    )}
                                    <div className="mb-1">
                                      <strong>Position:</strong> {banner.position}
                                    </div>
                                    {banner.startDate && (
                                      <div className="mb-1">
                                        <strong>Start Date:</strong> {new Date(banner.startDate).toLocaleDateString()}
                                      </div>
                                    )}
                                    {banner.endDate && (
                                      <div className="mb-1">
                                        <strong>End Date:</strong> {new Date(banner.endDate).toLocaleDateString()}
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="mt-4 flex justify-end space-x-2">
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      onClick={() => handleMoveBanner(banner._id, 'up')}
                                      disabled={index === 0}
                                    >
                                      <ArrowUp className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      onClick={() => handleMoveBanner(banner._id, 'down')}
                                      disabled={index === banners.length - 1}
                                    >
                                      <ArrowDown className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      onClick={() => handleEditBanner(banner)}
                                    >
                                      <Edit className="h-4 w-4 mr-1" />
                                      Edit
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                      onClick={() => handleDeleteBanner(banner._id)}
                                    >
                                      <Trash className="h-4 w-4 mr-1" />
                                      Delete
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </TabsContent>
          
          <TabsContent value="homepage" className="space-y-6 mt-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Homepage Layout</h2>
              <Button onClick={handleAddSection}>
                <Plus className="mr-2 h-4 w-4" />
                Add Section
              </Button>
            </div>
            
            {isSectionsLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              </div>
            ) : sectionsError ? (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <p className="text-sm text-red-700">{sectionsError}</p>
                </div>
              </div>
            ) : sections.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Settings className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No Homepage Sections</h3>
                  <p className="text-gray-500 mb-4 text-center max-w-md">
                    Homepage sections allow you to organize how products and content are displayed on your homepage.
                  </p>
                  <Button onClick={handleAddSection}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Section
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="sections" type="section">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-4"
                    >
                      {sections.map((section, index) => (
                        <Draggable key={section._id} draggableId={section._id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="border rounded-lg overflow-hidden bg-white p-4"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="flex items-center">
                                    <h3 className="text-lg font-medium">{section.title}</h3>
                                    <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-800">
                                      {getSectionTypeLabel(section.type)}
                                    </span>
                                  </div>
                                  <div className="mt-2 text-sm text-gray-500">
                                    <div className="mb-1">
                                      <strong>Position:</strong> {section.position}
                                    </div>
                                    <div className="mb-1">
                                      <strong>Items:</strong> {section.config.itemCount || 8}
                                    </div>
                                    {section.config.viewAllLink && (
                                      <div className="mb-1">
                                        <strong>View All Link:</strong> {section.config.viewAllLink}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    id={`toggle-section-${section._id}`}
                                    checked={section.isActive}
                                    onCheckedChange={(checked) => handleToggleSectionStatus(section._id, checked)}
                                  />
                                  <Label htmlFor={`toggle-section-${section._id}`}>
                                    {section.isActive ? 'Active' : 'Inactive'}
                                  </Label>
                                </div>
                              </div>
                              
                              <div className="mt-4 flex justify-end space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => handleMoveSection(section._id, 'up')}
                                  disabled={index === 0}
                                >
                                  <ArrowUp className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => handleMoveSection(section._id, 'down')}
                                  disabled={index === sections.length - 1}
                                >
                                  <ArrowDown className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => handleEditSection(section)}
                                >
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleDeleteSection(section._id)}
                                >
                                  <Trash className="h-4 w-4 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Banner Form Dialog */}
      <Dialog open={isBannerDialogOpen} onOpenChange={setIsBannerDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {editingBanner ? 'Edit Banner' : 'Add Banner'}
            </DialogTitle>
            <DialogDescription>
              {editingBanner 
                ? 'Update the details of this banner.' 
                : 'Create a new banner to display on your homepage.'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleBannerFormSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Banner Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={bannerFormData.title}
                    onChange={(e) => setBannerFormData({...bannerFormData, title: e.target.value})}
                    placeholder="e.g. Summer Sale"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subtitle">Subtitle (Optional)</Label>
                  <Input
                    id="subtitle"
                    name="subtitle"
                    value={bannerFormData.subtitle}
                    onChange={(e) => setBannerFormData({...bannerFormData, subtitle: e.target.value})}
                    placeholder="e.g. Up to 50% off"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="linkUrl">Link URL (Optional)</Label>
                  <Input
                    id="linkUrl"
                    name="linkUrl"
                    value={bannerFormData.linkUrl}
                    onChange={(e) => setBannerFormData({...bannerFormData, linkUrl: e.target.value})}
                    placeholder="e.g. /categories/summer-sale"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date (Optional)</Label>
                    <Input
                      id="startDate"
                      name="startDate"
                      type="date"
                      value={bannerFormData.startDate}
                      onChange={(e) => setBannerFormData({...bannerFormData, startDate: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date (Optional)</Label>
                    <Input
                      id="endDate"
                      name="endDate"
                      type="date"
                      value={bannerFormData.endDate}
                      onChange={(e) => setBannerFormData({...bannerFormData, endDate: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={bannerFormData.isActive}
                    onCheckedChange={(checked) => setBannerFormData({...bannerFormData, isActive: checked})}
                  />
                  <Label htmlFor="isActive">
                    {bannerFormData.isActive ? 'Active' : 'Inactive'}
                  </Label>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bannerImage">Banner Image</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    {bannerImagePreview ? (
                      <div className="relative">
                        <img 
                          src={bannerImagePreview} 
                          alt="Banner preview" 
                          className="max-h-48 mx-auto rounded"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => {
                            setBannerImagePreview(null);
                            setBannerImageFile(null);
                            if (editingBanner) {
                              setBannerFormData({...bannerFormData, imageUrl: ''});
                            }
                          }}
                        >
                          Remove Image
                        </Button>
                      </div>
                    ) : (
                      <div className="py-4">
                        <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 mb-2">
                          Drag and drop an image, or click to select
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('bannerImage')?.click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Image
                        </Button>
                      </div>
                    )}
                    <input
                      id="bannerImage"
                      name="bannerImage"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleBannerImageChange}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Recommended size: 1200 x 400 pixels. Max file size: 2MB.
                  </p>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsBannerDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    {editingBanner ? 'Update Banner' : 'Create Banner'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Section Form Dialog */}
      <Dialog open={isSectionDialogOpen} onOpenChange={setIsSectionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSection ? 'Edit Section' : 'Add Section'}
            </DialogTitle>
            <DialogDescription>
              {editingSection 
                ? 'Update the details of this homepage section.' 
                : 'Create a new section to display on your homepage.'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSectionFormSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Section Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={sectionFormData.title}
                  onChange={(e) => setSectionFormData({...sectionFormData, title: e.target.value})}
                  placeholder="e.g. Featured Products"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Section Type</Label>
                <Select 
                  value={sectionFormData.type} 
                  onValueChange={(value) => setSectionFormData({...sectionFormData, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select section type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured-products">Featured Products</SelectItem>
                    <SelectItem value="new-arrivals">New Arrivals</SelectItem>
                    <SelectItem value="best-sellers">Best Sellers</SelectItem>
                    <SelectItem value="category-products">Category Products</SelectItem>
                    <SelectItem value="featured-merchants">Featured Merchants</SelectItem>
                    <SelectItem value="custom-products">Custom Products Selection</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="itemCount">Number of Items</Label>
                <Input
                  id="itemCount"
                  name="itemCount"
                  type="number"
                  min="1"
                  max="20"
                  value={sectionFormData.config.itemCount}
                  onChange={(e) => setSectionFormData({
                    ...sectionFormData, 
                    config: {
                      ...sectionFormData.config,
                      itemCount: parseInt(e.target.value)
                    }
                  })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="viewAllLink">View All Link (Optional)</Label>
                <Input
                  id="viewAllLink"
                  name="viewAllLink"
                  value={sectionFormData.config.viewAllLink}
                  onChange={(e) => setSectionFormData({
                    ...sectionFormData, 
                    config: {
                      ...sectionFormData.config,
                      viewAllLink: e.target.value
                    }
                  })}
                  placeholder="e.g. /categories/featured"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="showTitle"
                  checked={sectionFormData.config.showTitle}
                  onCheckedChange={(checked) => setSectionFormData({
                    ...sectionFormData, 
                    config: {
                      ...sectionFormData.config,
                      showTitle: checked
                    }
                  })}
                />
                <Label htmlFor="showTitle">
                  Show Section Title
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={sectionFormData.isActive}
                  onCheckedChange={(checked) => setSectionFormData({...sectionFormData, isActive: checked})}
                />
                <Label htmlFor="isActive">
                  {sectionFormData.isActive ? 'Active' : 'Inactive'}
                </Label>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsSectionDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    {editingSection ? 'Update Section' : 'Create Section'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}