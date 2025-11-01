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
  Eye
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Photo Gallery</h1>
          <p className="text-gray-600 mt-1">
            Manage your business photos ({gallery.length}/20)
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate("/merchant/dashboard")}>
          Back to Dashboard
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

      {/* Upload Section */}
      {gallery.length < 20 && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Photos</CardTitle>
            <CardDescription>
              Add photos to showcase your business (Max 20 photos, 5MB each)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Selected Files Preview */}
            {previewUrls.length > 0 && (
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                {previewUrls.map((url, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={url}
                      alt={`Preview ${idx + 1}`}
                      className="w-full h-24 object-cover rounded"
                    />
                    <button
                      onClick={() => handleRemoveSelectedFile(idx)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Controls */}
            <div className="flex gap-3">
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
                className={`flex-1 flex items-center justify-center border-2 border-dashed rounded-lg p-4 cursor-pointer hover:bg-gray-50 ${
                  uploading || gallery.length >= 20 ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <Upload className="h-5 w-5 mr-2" />
                Select Photos
              </label>

              {selectedFiles.length > 0 && (
                <Button
                  onClick={handleUploadPhotos}
                  disabled={uploading}
                  className="px-8"
                >
                  {uploading ? "Uploading..." : `Upload ${selectedFiles.length} Photo(s)`}
                </Button>
              )}
            </div>

            <p className="text-xs text-gray-500">
              Accepted formats: JPEG, PNG, WebP (Max 5MB each, up to {20 - gallery.length} more photos)
            </p>
          </CardContent>
        </Card>
      )}

      {/* Gallery Grid */}
      {gallery.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ImageIcon className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No photos yet</h3>
            <p className="text-gray-600 mb-4">Start by uploading photos of your business</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Your Gallery</CardTitle>
            <CardDescription>
              Click on a photo to preview. Use arrows to reorder.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {gallery.map((photo, index) => (
                <div
                  key={photo._id}
                  className="relative group bg-gray-100 rounded-lg overflow-hidden aspect-square"
                >
                  {/* Photo */}
                  <img
                    src={photo.url}
                    alt={photo.caption || `Gallery photo ${index + 1}`}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => handlePreview(photo)}
                  />

                  {/* Featured Badge */}
                  {photo.featured && (
                    <Badge className="absolute top-2 left-2 bg-yellow-500">
                      <Star className="h-3 w-3 mr-1 fill-white" />
                      Featured
                    </Badge>
                  )}

                  {/* Hover Actions */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handlePreview(photo)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>

                    {!photo.featured && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleSetFeatured(photo._id)}
                        className="h-8 w-8 p-0"
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                    )}

                    {index > 0 && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleMovePhoto(photo._id, "up")}
                        className="h-8 w-8 p-0"
                      >
                        <MoveUp className="h-4 w-4" />
                      </Button>
                    )}

                    {index < gallery.length - 1 && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleMovePhoto(photo._id, "down")}
                        className="h-8 w-8 p-0"
                      >
                        <MoveDown className="h-4 w-4" />
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeletePhoto(photo._id)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Photo Order */}
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                    #{index + 1}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gallery Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg">Gallery Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p><strong>Featured Photo:</strong> Set your best photo as featured - it will appear first in your public gallery</p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p><strong>Photo Order:</strong> Use the up/down arrows to reorder photos by importance</p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p><strong>Quality Matters:</strong> Upload high-quality, well-lit photos that showcase your business</p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p><strong>Variety:</strong> Include photos of your products, services, storefront, and team</p>
          </div>
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p><strong>File Size:</strong> Keep images under 5MB for faster loading</p>
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
  );
};

export default PhotoGallery;