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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  AlertCircle, 
  CheckCircle, 
  Loader2, 
  Plus, 
  Save, 
  Settings, 
  Trash 
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FeatureToggle {
  _id: string;
  name: string;
  key: string;
  description: string;
  enabled: boolean;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminFeaturesPage() {
  const { toast } = useToast();
  
  // State for feature toggles
  const [featureToggles, setFeatureToggles] = useState<FeatureToggle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // State for feature toggle form
  const [isFeatureDialogOpen, setIsFeatureDialogOpen] = useState(false);
  const [editingFeature, setEditingFeature] = useState<FeatureToggle | null>(null);
  const [featureFormData, setFeatureFormData] = useState({
    name: '',
    key: '',
    description: '',
    enabled: false,
    category: 'general'
  });
  
  // State for bulk update
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Fetch feature toggles
  useEffect(() => {
    fetchFeatureToggles();
  }, []);
  
  const fetchFeatureToggles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // This endpoint needs to be implemented in the backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/features`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch feature toggles");
      }
      
      const data = await response.json();
      setFeatureToggles(data.features);
    } catch (err: any) {
      console.error("Error fetching feature toggles:", err);
      setError(err.message || "Failed to load feature toggles. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleToggleFeature = (featureId: string, enabled: boolean) => {
    setFeatureToggles(prev => 
      prev.map(feature => 
        feature._id === featureId ? { ...feature, enabled } : feature
      )
    );
    setHasChanges(true);
  };
  
  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);
      
      // This endpoint needs to be implemented in the backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/features/bulk-update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          features: featureToggles.map(feature => ({
            _id: feature._id,
            enabled: feature.enabled
          }))
        }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error("Failed to update feature toggles");
      }
      
      setSuccess("Feature toggles updated successfully");
      setHasChanges(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err: any) {
      console.error("Error updating feature toggles:", err);
      setError(err.message || "Failed to update feature toggles. Please try again later.");
      
      // Clear error message after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleAddFeature = () => {
    setEditingFeature(null);
    setFeatureFormData({
      name: '',
      key: '',
      description: '',
      enabled: false,
      category: 'general'
    });
    setIsFeatureDialogOpen(true);
  };
  
  const handleEditFeature = (feature: FeatureToggle) => {
    setEditingFeature(feature);
    setFeatureFormData({
      name: feature.name,
      key: feature.key,
      description: feature.description,
      enabled: feature.enabled,
      category: feature.category
    });
    setIsFeatureDialogOpen(true);
  };
  
  const handleDeleteFeature = async (featureId: string) => {
    if (!confirm("Are you sure you want to delete this feature toggle? This action cannot be undone.")) {
      return;
    }
    
    try {
      // This endpoint needs to be implemented in the backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/features/${featureId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete feature toggle");
      }
      
      // Remove feature from state
      setFeatureToggles(prev => prev.filter(feature => feature._id !== featureId));
      
      toast({
        title: "Feature toggle deleted",
        description: "The feature toggle has been deleted successfully."
      });
    } catch (err: any) {
      console.error("Error deleting feature toggle:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to delete feature toggle."
      });
    }
  };
  
  const handleFeatureFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const isEditing = !!editingFeature;
      const url = isEditing 
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/features/${editingFeature._id}`
        : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/features`;
      
      const method = isEditing ? 'PUT' : 'POST';
      
      // This endpoint needs to be implemented in the backend
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(featureFormData),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${isEditing ? 'update' : 'create'} feature toggle`);
      }
      
      const data = await response.json();
      
      if (isEditing) {
        // Update feature in state
        setFeatureToggles(prev => 
          prev.map(feature => 
            feature._id === editingFeature._id ? data.feature : feature
          )
        );
        
        toast({
          title: "Feature toggle updated",
          description: "The feature toggle has been updated successfully."
        });
      } else {
        // Add new feature to state
        setFeatureToggles(prev => [...prev, data.feature]);
        
        toast({
          title: "Feature toggle created",
          description: "The feature toggle has been created successfully."
        });
      }
      
      setIsFeatureDialogOpen(false);
    } catch (err: any) {
      console.error(`Error ${editingFeature ? 'updating' : 'creating'} feature toggle:`, err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || `Failed to ${editingFeature ? 'update' : 'create'} feature toggle.`
      });
    }
  };
  
  const handleFeatureFormInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFeatureFormData(prev => ({
        ...prev,
        [name]: target.checked
      }));
    } else {
      setFeatureFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleFeatureKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Convert the name to a kebab-case key if the key field is empty
    if (!editingFeature && featureFormData.key === '') {
      const value = e.target.value;
      const key = value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      setFeatureFormData(prev => ({
        ...prev,
        name: value,
        key
      }));
    } else {
      handleFeatureFormInputChange(e);
    }
  };
  
  // Group features by category
  const featuresByCategory = featureToggles.reduce((acc, feature) => {
    const category = feature.category || 'general';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(feature);
    return acc;
  }, {} as Record<string, FeatureToggle[]>);
  
  const categories = Object.keys(featuresByCategory).sort();
  
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Feature Toggles</h1>
          <div className="flex gap-2">
            <Button onClick={handleAddFeature}>
              <Plus className="mr-2 h-4 w-4" />
              Add Feature Toggle
            </Button>
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
                    Save Changes
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
        
        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        )}
        
        {/* Feature Toggles */}
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        ) : featureToggles.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Settings className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No Feature Toggles</h3>
              <p className="text-gray-500 mb-4 text-center max-w-md">
                Feature toggles allow you to enable or disable specific features on your site without deploying new code.
              </p>
              <Button onClick={handleAddFeature}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Feature Toggle
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue={categories[0]}>
            <TabsList className="mb-4">
              {categories.map(category => (
                <TabsTrigger key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {categories.map(category => (
              <TabsContent key={category} value={category}>
                <Card>
                  <CardHeader>
                    <CardTitle>{category.charAt(0).toUpperCase() + category.slice(1)} Features</CardTitle>
                    <CardDescription>
                      Manage {category} feature toggles across your platform
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {featuresByCategory[category].map(feature => (
                        <div 
                          key={feature._id} 
                          className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex-1 mr-4">
                            <div className="flex items-center">
                              <h3 className="text-lg font-medium">{feature.name}</h3>
                              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-800">
                                {feature.key}
                              </span>
                            </div>
                            <p className="text-gray-500 mt-1">{feature.description}</p>
                            <div className="text-xs text-gray-400 mt-2">
                              Last updated: {new Date(feature.updatedAt).toLocaleString()}
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <Switch
                                id={`toggle-${feature._id}`}
                                checked={feature.enabled}
                                onCheckedChange={(checked) => handleToggleFeature(feature._id, checked)}
                              />
                              <Label htmlFor={`toggle-${feature._id}`}>
                                {feature.enabled ? 'Enabled' : 'Disabled'}
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleEditFeature(feature)}
                              >
                                Edit
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDeleteFeature(feature._id)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
      
      {/* Feature Toggle Form Dialog */}
      <Dialog open={isFeatureDialogOpen} onOpenChange={setIsFeatureDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingFeature ? 'Edit Feature Toggle' : 'Add Feature Toggle'}
            </DialogTitle>
            <DialogDescription>
              {editingFeature 
                ? 'Update the details of this feature toggle.' 
                : 'Create a new feature toggle to control functionality on your site.'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleFeatureFormSubmit}>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="name">Feature Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={featureFormData.name}
                  onChange={handleFeatureKeyChange}
                  placeholder="e.g. Enable Dark Mode"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="key">Feature Key</Label>
                <Input
                  id="key"
                  name="key"
                  value={featureFormData.key}
                  onChange={handleFeatureFormInputChange}
                  placeholder="e.g. enable-dark-mode"
                  required
                  disabled={!!editingFeature}
                  className={editingFeature ? "bg-gray-100" : ""}
                />
                {!editingFeature && (
                  <p className="text-xs text-gray-500">
                    This is the unique identifier used in code. It will be auto-generated from the name.
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={featureFormData.description}
                  onChange={handleFeatureFormInputChange}
                  placeholder="Describe what this feature toggle controls..."
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  name="category"
                  value={featureFormData.category}
                  onChange={handleFeatureFormInputChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="general">General</option>
                  <option value="ui">User Interface</option>
                  <option value="commerce">E-Commerce</option>
                  <option value="merchant">Merchant Features</option>
                  <option value="client">Client Features</option>
                  <option value="security">Security</option>
                  <option value="performance">Performance</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="enabled"
                  name="enabled"
                  checked={featureFormData.enabled}
                  onCheckedChange={(checked) => 
                    setFeatureFormData(prev => ({ ...prev, enabled: checked }))
                  }
                />
                <Label htmlFor="enabled">
                  {featureFormData.enabled ? 'Enabled' : 'Disabled'}
                </Label>
              </div>
            </div>
            
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsFeatureDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingFeature ? 'Update Feature' : 'Create Feature'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}