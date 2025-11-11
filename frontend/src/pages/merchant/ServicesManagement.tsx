import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Clock,
  MoveUp,
  MoveDown,
  Upload,
  X,
  Image as ImageIcon,
  Video,
  ArrowLeft,
  Sparkles
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Service {
  _id: string;
  name: string;
  description: string;
  price: string;
  duration?: string;
  active: boolean;
  order: number;
  images?: string[];
  videos?: string[];
}

const ServicesManagement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    duration: "",
    active: true
  });

  // Image and video upload state
  const [serviceImages, setServiceImages] = useState<File[]>([]);
  const [serviceVideos, setServiceVideos] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [previewVideos, setPreviewVideos] = useState<string[]>([]);
  const [deletingMedia, setDeletingMedia] = useState<string | null>(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/merchants/dashboard/services`, {
        withCredentials: true
      });
      setServices(response.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenServiceModal = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        description: service.description,
        price: service.price,
        duration: service.duration || "",
        active: service.active
      });
      setPreviewImages(service.images || []);
      setPreviewVideos(service.videos || []);
    } else {
      setEditingService(null);
      setFormData({
        name: "",
        description: "",
        price: "",
        duration: "",
        active: true
      });
      setPreviewImages([]);
      setPreviewVideos([]);
    }
    setServiceImages([]);
    setServiceVideos([]);
    setIsModalOpen(true);
  };

  const handleCloseServiceModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      duration: "",
      active: true
    });
    setServiceImages([]);
    setServiceVideos([]);
    setPreviewImages([]);
    setPreviewVideos([]);
    setError("");
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    const validFiles = files.filter(file => {
      if (!file.type.startsWith("image/")) {
        setError("Please select only image files");
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Each image must be less than 5MB");
        return false;
      }
      return true;
    });

    const currentTotal = previewImages.length + serviceImages.length;
    const remaining = 5 - currentTotal;
    
    if (validFiles.length > remaining) {
      setError(`You can only upload ${remaining} more image(s). Maximum 5 images per service.`);
      return;
    }

    setServiceImages([...serviceImages, ...validFiles]);

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    const validFiles = files.filter(file => {
      if (!file.type.startsWith("video/")) {
        setError("Please select only video files");
        return false;
      }
      if (file.size > 50 * 1024 * 1024) {
        setError("Each video must be less than 50MB");
        return false;
      }
      return true;
    });

    const currentTotal = previewVideos.length + serviceVideos.length;
    const remaining = 3 - currentTotal;
    
    if (validFiles.length > remaining) {
      setError(`You can only upload ${remaining} more video(s). Maximum 3 videos per service.`);
      return;
    }

    setServiceVideos([...serviceVideos, ...validFiles]);

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewVideos(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveNewImage = (index: number) => {
    setServiceImages(prev => prev.filter((_, i) => i !== index));
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveNewVideo = (index: number) => {
    setServiceVideos(prev => prev.filter((_, i) => i !== index));
    setPreviewVideos(prev => prev.filter((_, i) => i !== index));
  };

  const handleDeleteExistingImage = async (imageUrl: string, serviceId: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;
  
    try {
      setDeletingMedia(imageUrl);
      const service = services.find(s => s._id === serviceId);
      if (!service) throw new Error("Service not found");

      const updatedImages = (service.images || []).filter(img => img !== imageUrl);
      
      await axios.put(`${API_BASE_URL}/merchants/dashboard/services/${serviceId}`, {
        ...service,
        images: updatedImages
      }, { withCredentials: true });
      
      setSuccess("Image deleted successfully");
      await fetchServices();
      
      if (editingService && editingService._id === serviceId) {
        setPreviewImages(prev => prev.filter(img => img !== imageUrl));
      }
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete image");
    } finally {
      setDeletingMedia(null);
    }
  };

  const handleDeleteExistingVideo = async (videoUrl: string, serviceId: string) => {
    if (!confirm("Are you sure you want to delete this video?")) return;
  
    try {
      setDeletingMedia(videoUrl);
      const service = services.find(s => s._id === serviceId);
      if (!service) throw new Error("Service not found");

      const updatedVideos = (service.videos || []).filter(vid => vid !== videoUrl);
      
      await axios.put(`${API_BASE_URL}/merchants/dashboard/services/${serviceId}`, {
        ...service,
        videos: updatedVideos
      }, { withCredentials: true });
      
      setSuccess("Video deleted successfully");
      await fetchServices();
      
      if (editingService && editingService._id === serviceId) {
        setPreviewVideos(prev => prev.filter(vid => vid !== videoUrl));
      }
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete video");
    } finally {
      setDeletingMedia(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.name) {
      setError("Service name is required");
      return;
    }

    try {
      setUploading(true);
      console.log('📦 Submitting service:', formData);

      let uploadedImageUrls: string[] = [];
      let uploadedVideoUrls: string[] = [];

      // Upload new images if any
      if (serviceImages.length > 0) {
        console.log('🔄 Uploading service images...');
        const imageFormData = new FormData();
        serviceImages.forEach(file => {
          imageFormData.append("images", file);
        });

        const imageUploadResponse = await axios.post("/api/uploads/services", imageFormData, {
          withCredentials: true,
          headers: { 
            "Content-Type": "multipart/form-data",
            "Accept": "application/json"
          },
          timeout: 60000,
        });

        console.log('✅ Image upload response:', imageUploadResponse.data);
        
        if (imageUploadResponse.data.files) {
          uploadedImageUrls = imageUploadResponse.data.files.map((file: { url: string }) => file.url);
        } else if (imageUploadResponse.data.data) {
          uploadedImageUrls = imageUploadResponse.data.data;
        }
        
        console.log('✅ Images uploaded:', uploadedImageUrls);
      }

      // Upload new videos if any
      if (serviceVideos.length > 0) {
        console.log('🔄 Uploading service videos...');
        const videoFormData = new FormData();
        serviceVideos.forEach(file => {
          videoFormData.append("videos", file);
        });

        const videoUploadResponse = await axios.post("/api/uploads/services/videos", videoFormData, {
          withCredentials: true,
          headers: { 
            "Content-Type": "multipart/form-data",
            "Accept": "application/json"
          },
          timeout: 120000, // 2 minutes for videos
        });

        console.log('✅ Video upload response:', videoUploadResponse.data);
        
        if (videoUploadResponse.data.files) {
          uploadedVideoUrls = videoUploadResponse.data.files.map((file: { url: string }) => file.url);
        } else if (videoUploadResponse.data.data) {
          uploadedVideoUrls = videoUploadResponse.data.data;
        }
        
        console.log('✅ Videos uploaded:', uploadedVideoUrls);
      }

      if (editingService) {
        // Update existing service - merge existing and new media
        const existingImages = previewImages.filter(img => img.startsWith('http'));
        const existingVideos = previewVideos.filter(vid => vid.startsWith('http'));
        
        const updateData = {
          ...formData,
          images: [...existingImages, ...uploadedImageUrls],
          videos: [...existingVideos, ...uploadedVideoUrls]
        };

        console.log('🔄 Updating service:', editingService._id);
        await axios.put(
          `${API_BASE_URL}/merchants/dashboard/services/${editingService._id}`,
          updateData,
          { withCredentials: true }
        );
        setSuccess("Service updated successfully");
      } else {
        // Create new service
        const serviceData = {
          ...formData,
          images: uploadedImageUrls,
          videos: uploadedVideoUrls
        };

        console.log('🔄 Creating new service with data:', serviceData);
        await axios.post(
          `${API_BASE_URL}/merchants/dashboard/services`,
          serviceData,
          { withCredentials: true }
        );
        setSuccess("Service created successfully");
      }

      await fetchServices();
      handleCloseServiceModal();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      console.error('❌ Service submission error:', err);
      setError(err.response?.data?.error || err.response?.data?.message || "Failed to save service");
    } finally {
      setUploading(false);
    }
  };

  const handleToggleActive = async (serviceId: string, currentStatus: boolean) => {
    try {
      await axios.patch(
        `${API_BASE_URL}/merchants/dashboard/services/${serviceId}/toggle`,
        { active: !currentStatus },
        { withCredentials: true }
      );
      
      setSuccess(`Service ${!currentStatus ? "activated" : "deactivated"} successfully`);
      await fetchServices();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update service");
    }
  };

  const handleDelete = async (serviceId: string) => {
    if (!confirm("Are you sure you want to delete this service?")) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/merchants/dashboard/services/${serviceId}`, {
        withCredentials: true
      });
      setSuccess("Service deleted successfully");
      await fetchServices();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete service");
    }
  };

  const handleReorder = async (serviceId: string, direction: "up" | "down") => {
    const currentIndex = services.findIndex(s => s._id === serviceId);
    if (currentIndex === -1) return;

    if (direction === "up" && currentIndex === 0) return;
    if (direction === "down" && currentIndex === services.length - 1) return;

    const newOrder = [...services];
    const [movedService] = newOrder.splice(currentIndex, 1);
    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    newOrder.splice(newIndex, 0, movedService);

    // Update order values
    const serviceIds = newOrder.map(s => s._id);

    try {
      await axios.patch(
        `${API_BASE_URL}/merchants/dashboard/services/reorder`,
        { serviceIds },
        { withCredentials: true }
      );
      
      await fetchServices();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to reorder services");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Services & Pricing</h1>
          <p className="text-gray-600 mt-1">
            Manage your business services and pricing
          </p>
        </div>
        <Button onClick={() => handleOpenServiceModal()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Service
        </Button>
      </div>

      {/* Alert Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-500 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-700">{success}</AlertDescription>
        </Alert>
      )}

      {/* Services List */}
      {services.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <DollarSign className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No services yet</h3>
            <p className="text-gray-600 mb-4">Start by adding your first service</p>
            <Button onClick={() => handleOpenServiceModal()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Service
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service, index) => (
            <Card key={service._id} className={!service.active ? "opacity-60" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={service.active ? "default" : "secondary"}>
                        {service.active ? "Active" : "Inactive"}
                      </Badge>
                      {service.duration && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {service.duration}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {index > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReorder(service._id, "up")}
                        className="h-8 w-8 p-0"
                      >
                        <MoveUp className="h-4 w-4" />
                      </Button>
                    )}
                    {index < services.length - 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReorder(service._id, "down")}
                        className="h-8 w-8 p-0"
                      >
                        <MoveDown className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {service.description || "No description provided"}
                </p>
                <p className="text-lg font-bold text-blue-600 mb-4">
                  {service.price || "Contact for pricing"}
                </p>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleOpenServiceModal(service)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleActive(service._id, service.active)}
                  >
                    {service.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(service._id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Service Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingService ? "Edit Service" : "Add New Service"}
            </DialogTitle>
            <DialogDescription>
              {editingService
                ? "Update your service details"
                : "Add a new service to your business profile"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Service Name */}
            <div>
              <Label htmlFor="name">
                Service Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Basic Web Design, Hair Styling, Plumbing Repair"
                disabled={uploading}
                required
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what this service includes..."
                rows={3}
                disabled={uploading}
              />
            </div>

            {/* Price */}
            <div>
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="e.g., KES 5,000, $50, Contact for pricing"
                disabled={uploading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter price or "Contact for pricing" if varies
              </p>
            </div>

            {/* Duration */}
            <div>
              <Label htmlFor="duration">Duration (Optional)</Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="e.g., 1 hour, 2 days, 1 week"
                disabled={uploading}
              />
            </div>

            {/* Image Upload */}
            <div>
              <Label>Service Images (Max 5) - Optional</Label>
              <p className="text-xs text-gray-500 mb-2">Upload before/after photos or service examples</p>
              
              {/* Preview Grid */}
              {previewImages.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {previewImages.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={img}
                        alt={`Preview ${idx + 1}`}
                        className="w-full h-24 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (editingService && img.startsWith("http")) {
                            handleDeleteExistingImage(img, editingService._id);
                          } else {
                            handleRemoveNewImage(idx);
                          }
                        }}
                        disabled={deletingMedia === img}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Button */}
              {previewImages.length < 5 && (
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                    className="hidden"
                    id="service-images"
                    disabled={uploading}
                  />
                  <Label
                    htmlFor="service-images"
                    className="flex items-center justify-center border-2 border-dashed rounded-lg p-4 cursor-pointer hover:bg-gray-50"
                  >
                    <ImageIcon className="h-5 w-5 mr-2" />
                    Upload Images ({previewImages.length}/5)
                  </Label>
                  <p className="text-xs text-gray-500 mt-1">
                    JPEG, PNG (Max 5MB each)
                  </p>
                </div>
              )}
            </div>

            {/* Video Upload */}
            <div>
              <Label>Service Videos (Max 3) - Optional</Label>
              <p className="text-xs text-gray-500 mb-2">Upload demo videos or service walkthroughs</p>
              
              {/* Preview Grid */}
              {previewVideos.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {previewVideos.map((vid, idx) => (
                    <div key={idx} className="relative group">
                      <video
                        src={vid}
                        className="w-full h-24 object-cover rounded bg-black"
                        controls={false}
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded">
                        <Video className="h-8 w-8 text-white" />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (editingService && vid.startsWith("http")) {
                            handleDeleteExistingVideo(vid, editingService._id);
                          } else {
                            handleRemoveNewVideo(idx);
                          }
                        }}
                        disabled={deletingMedia === vid}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Button */}
              {previewVideos.length < 3 && (
                <div>
                  <input
                    type="file"
                    accept="video/*"
                    multiple
                    onChange={handleVideoSelect}
                    className="hidden"
                    id="service-videos"
                    disabled={uploading}
                  />
                  <Label
                    htmlFor="service-videos"
                    className="flex items-center justify-center border-2 border-dashed rounded-lg p-4 cursor-pointer hover:bg-gray-50"
                  >
                    <Video className="h-5 w-5 mr-2" />
                    Upload Videos ({previewVideos.length}/3)
                  </Label>
                  <p className="text-xs text-gray-500 mt-1">
                    MP4, MOV, WebM (Max 50MB each)
                  </p>
                </div>
              )}
            </div>

            {/* Active Status */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                disabled={uploading}
                className="h-4 w-4"
              />
              <Label htmlFor="active" className="cursor-pointer">
                Display this service on my public profile
              </Label>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseServiceModal}
                disabled={uploading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={uploading}>
                {uploading ? "Saving..." : editingService ? "Update Service" : "Add Service"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServicesManagement;
