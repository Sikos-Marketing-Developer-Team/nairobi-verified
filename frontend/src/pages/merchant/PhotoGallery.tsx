import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Upload,
  Trash2,
  Star,
  AlertCircle,
  CheckCircle,
  Image as ImageIcon,
  MoveUp,
  MoveDown,
  Eye,
  ArrowLeft,
  Camera,
  Sparkles,
  Grid3x3,
  X
} from "lucide-react";

interface GalleryPhoto {
  _id: string;
  url: string;
  caption?: string;
  featured: boolean;
  order: number;
  uploadedAt: string;
}

const PhotoGallery = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [gallery, setGallery] = useState<GalleryPhoto[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Preview modal
  const [previewPhoto, setPreviewPhoto] = useState<GalleryPhoto | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  
  // Upload state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching gallery...');
      const response = await axios.get("/api/merchants/dashboard/gallery");
      console.log('✅ Gallery fetched:', response.data);
      console.log('Photos count:', response.data.data?.length || 0);
      setGallery(response.data.data || []);
    } catch (err: any) {
      console.error('❌ Failed to fetch gallery:', err);
      setError(err.response?.data?.message || "Failed to load gallery");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate file types and sizes
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

    // Check gallery limit (max 20 photos)
    const currentTotal = gallery.length + selectedFiles.length;
    const remaining = 20 - currentTotal;
    
    if (validFiles.length > remaining) {
      setError(`You can only upload ${remaining} more photo(s). Maximum 20 photos in gallery.`);
      return;
    }

    setSelectedFiles([...selectedFiles, ...validFiles]);

    // Create preview URLs
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrls(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleUploadPhotos = async () => {
    if (selectedFiles.length === 0) {
      setError("Please select photos to upload");
      return;
    }

    try {
      setUploading(true);
      setError("");
      setSuccess("");

      console.log('📸 Starting photo upload...');
      console.log('Files to upload:', selectedFiles.length);
      selectedFiles.forEach((file, index) => {
        console.log(`  [${index + 1}] ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
      });

      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append("photos", file);
      });

  
      console.log('🔄 Sending upload request...');
      const response = await axios.post("/api/merchants/dashboard/gallery", formData, {
        withCredentials: true,
        headers: { 
          "Content-Type": "multipart/form-data",
          "Accept": "application/json"
        },
        timeout: 60000, // 60 second timeout for file uploads
      });

      console.log('✅ Upload successful:', response.data);
      console.log('Uploaded photos:', response.data.data);

      setSuccess(`${selectedFiles.length} photo(s) uploaded successfully`);
      setSelectedFiles([]);
      setPreviewUrls([]);
      
      console.log('🔄 Fetching updated gallery...');
      await fetchGallery();
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      console.error('❌ Upload failed:', err);
      console.error('Error response:', err.response?.data);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 
                          (err.code === 'ECONNABORTED' ? 'Upload timeout. Please try again with fewer photos.' : 
                          err.code === 'ERR_NETWORK' ? 'Network error. Please check your connection.' :
                          "Failed to upload photos");
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm("Are you sure you want to delete this photo?")) {
      return;
    }

    try {
      await axios.delete(`/api/merchants/dashboard/gallery/${photoId}`);
      setSuccess("Photo deleted successfully");
      await fetchGallery();
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete photo");
    }
  };

  const handleSetFeatured = async (photoId: string) => {
    try {
      await axios.patch(`/api/merchants/dashboard/gallery/${photoId}/featured`);
      setSuccess("Featured photo updated");
      await fetchGallery();
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to set featured photo");
    }
  };

  const handleMovePhoto = async (photoId: string, direction: "up" | "down") => {
    const currentIndex = gallery.findIndex(p => p._id === photoId);
    if (currentIndex === -1) return;

    if (direction === "up" && currentIndex === 0) return;
    if (direction === "down" && currentIndex === gallery.length - 1) return;

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const newOrder = [...gallery];
    const [movedPhoto] = newOrder.splice(currentIndex, 1);
    newOrder.splice(newIndex, 0, movedPhoto);

    // Update order values
    const photoIds = newOrder.map(p => p._id);

    try {
      await axios.patch("/api/merchants/dashboard/gallery/reorder", {
        photoIds
      });
      
      await fetchGallery();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to reorder photos");
    }
  };

  const handlePreview = (photo: GalleryPhoto) => {
    setPreviewPhoto(photo);
    setShowPreview(true);
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    setPreviewPhoto(null);
  };

  if (loading && gallery.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-purple-600"></div>
          <p className="text-gray-600">Loading your gallery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {/* Modern Header with Gradient */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 md:p-8 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="ghost" 
              className="text-white hover:bg-white/20"
              onClick={() => navigate("/merchant/dashboard")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </div>
          
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-2">
              <Camera className="h-8 w-8" />
              Photo Gallery
            </h1>
            <p className="text-purple-100 text-lg">
              Showcase your business with stunning visuals
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-1">
                <ImageIcon className="h-4 w-4" />
                <p className="text-xs uppercase tracking-wide text-purple-100">Total Photos</p>
              </div>
              <p className="text-2xl font-bold">{gallery.length}/20</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-1">
                <Star className="h-4 w-4" />
                <p className="text-xs uppercase tracking-wide text-purple-100">Featured</p>
              </div>
              <p className="text-2xl font-bold">{gallery.filter(p => p.featured).length}</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-1">
                <Upload className="h-4 w-4" />
                <p className="text-xs uppercase tracking-wide text-purple-100">Remaining</p>
              </div>
              <p className="text-2xl font-bold">{20 - gallery.length}</p>
            </div>
          </div>
        </div>

        {/* Alert Messages */}
        {error && (
          <Alert variant="destructive" className="shadow-lg border-red-200">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription className="font-medium">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-500 bg-green-50 shadow-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <AlertDescription className="text-green-800 font-medium">{success}</AlertDescription>
          </Alert>
        )}

        {/* Upload Section */}
        {gallery.length < 20 && (
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-purple-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Sparkles className="h-5 w-5 text-purple-600" />
                Upload New Photos
              </CardTitle>
              <CardDescription>
                Add stunning photos of your business (Max 20 photos, 5MB each)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Selected Files Preview */}
              {previewUrls.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-3 text-gray-700">Selected Photos ({previewUrls.length})</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {previewUrls.map((url, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={url}
                          alt={`Preview ${idx + 1}`}
                          className="w-full h-32 object-cover rounded-lg shadow-md"
                        />
                        <button
                          onClick={() => handleRemoveSelectedFile(idx)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:scale-110"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Controls */}
              <div className="flex flex-col md:flex-row gap-3">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  id="gallery-upload"
                  disabled={uploading || gallery.length >= 20}
                />
                <label
                  htmlFor="gallery-upload"
                  className={`flex-1 flex items-center justify-center border-2 border-dashed border-purple-300 rounded-xl p-6 cursor-pointer hover:bg-purple-50 hover:border-purple-400 transition-all ${
                    uploading || gallery.length >= 20 ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <div className="text-center">
                    <Upload className="h-10 w-10 mx-auto mb-2 text-purple-600" />
                    <p className="text-sm font-medium text-gray-700">Click to select photos</p>
                    <p className="text-xs text-gray-500 mt-1">or drag and drop</p>
                  </div>
                </label>

                {selectedFiles.length > 0 && (
                  <Button
                    onClick={handleUploadPhotos}
                    disabled={uploading}
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 md:px-8"
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload {selectedFiles.length} Photo{selectedFiles.length > 1 ? 's' : ''}
                      </>
                    )}
                  </Button>
                )}
              </div>

              <p className="text-xs text-gray-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                JPEG, PNG, WebP formats • Max 5MB each • Up to {20 - gallery.length} more photos
              </p>
            </CardContent>
          </Card>
        )}

        {/* Gallery Grid */}
        {gallery.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-full p-8 mb-4">
                <Camera className="h-20 w-20 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-gray-800">No photos yet</h3>
              <p className="text-gray-600 mb-6 text-center max-w-md">
                Start building your visual story by uploading photos of your business
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Grid3x3 className="h-5 w-5 text-purple-600" />
                    Your Gallery
                  </CardTitle>
                  <CardDescription>
                    Click to preview • Use arrows to reorder • Star to feature
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-sm">
                  {gallery.length} Photos
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {gallery.map((photo, index) => (
                  <div
                    key={photo._id}
                    className="relative group bg-gray-100 rounded-xl overflow-hidden aspect-square shadow-md hover:shadow-xl transition-all duration-300"
                  >
                    {/* Photo */}
                    <img
                      src={photo.url}
                      alt={photo.caption || `Gallery photo ${index + 1}`}
                      className="w-full h-full object-cover cursor-pointer group-hover:scale-110 transition-transform duration-500"
                      onClick={() => handlePreview(photo)}
                    />

                    {/* Gradient Overlay on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    {/* Featured Badge */}
                    {photo.featured && (
                      <Badge className="absolute top-3 left-3 bg-gradient-to-r from-yellow-500 to-orange-500 border-0 shadow-lg">
                        <Star className="h-3 w-3 mr-1 fill-white" />
                        Featured
                      </Badge>
                    )}

                    {/* Hover Actions */}
                    <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        className="bg-white/90 hover:bg-white text-gray-800 h-9 w-9 p-0 shadow-lg"
                        onClick={() => handlePreview(photo)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      {!photo.featured && (
                        <Button
                          size="sm"
                          className="bg-yellow-500 hover:bg-yellow-600 text-white h-9 w-9 p-0 shadow-lg"
                          onClick={() => handleSetFeatured(photo._id)}
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                      )}

                      {index > 0 && (
                        <Button
                          size="sm"
                          className="bg-blue-500 hover:bg-blue-600 text-white h-9 w-9 p-0 shadow-lg"
                          onClick={() => handleMovePhoto(photo._id, "up")}
                        >
                          <MoveUp className="h-4 w-4" />
                        </Button>
                      )}

                      {index < gallery.length - 1 && (
                        <Button
                          size="sm"
                          className="bg-blue-500 hover:bg-blue-600 text-white h-9 w-9 p-0 shadow-lg"
                          onClick={() => handleMovePhoto(photo._id, "down")}
                        >
                          <MoveDown className="h-4 w-4" />
                        </Button>
                      )}

                      <Button
                        size="sm"
                        className="bg-red-500 hover:bg-red-600 text-white h-9 w-9 p-0 shadow-lg"
                        onClick={() => handleDeletePhoto(photo._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Photo Order */}
                    <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full">
                      #{index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Gallery Tips */}
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-purple-900">
              <Sparkles className="h-5 w-5" />
              Pro Tips for Amazing Gallery
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
              <CheckCircle className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <p><strong className="text-purple-900">Featured Photo:</strong> Your best photo appears first and on your profile preview</p>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
              <CheckCircle className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <p><strong className="text-purple-900">Photo Order:</strong> Arrange photos by importance using up/down arrows</p>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
              <CheckCircle className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <p><strong className="text-purple-900">Quality Matters:</strong> Use high-resolution, well-lit photos for best results</p>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
              <CheckCircle className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <p><strong className="text-purple-900">Tell Your Story:</strong> Include products, services, workspace, and team</p>
            </div>
          </CardContent>
        </Card>

      {/* Preview Modal */}
      <Dialog open={showPreview} onOpenChange={handleClosePreview}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Photo Preview</DialogTitle>
            <DialogDescription>
              {previewPhoto?.featured && "Featured Photo"}
            </DialogDescription>
          </DialogHeader>
          
          {previewPhoto && (
            <div className="space-y-4">
              <img
                src={previewPhoto.url}
                alt={previewPhoto.caption || "Gallery photo"}
                className="w-full max-h-[70vh] object-contain rounded-lg"
              />
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Uploaded: {new Date(previewPhoto.uploadedAt).toLocaleDateString()}
                </div>
                
                <div className="flex gap-2">
                  {!previewPhoto.featured && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        handleSetFeatured(previewPhoto._id);
                        handleClosePreview();
                      }}
                    >
                      <Star className="h-4 w-4 mr-2" />
                      Set as Featured
                    </Button>
                  )}
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      handleDeletePhoto(previewPhoto._id);
                      handleClosePreview();
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Photo
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
};

export default PhotoGallery;