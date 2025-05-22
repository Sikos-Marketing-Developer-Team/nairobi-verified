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
  Bell, 
  CheckCircle, 
  Edit, 
  Eye, 
  Loader2, 
  Mail, 
  MessageSquare, 
  Plus, 
  Save, 
  Send, 
  Trash, 
  Users 
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  audience: string;
  status: string;
  scheduledFor?: string;
  sentAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface EmailTemplate {
  _id: string;
  name: string;
  subject: string;
  body: string;
  description: string;
  variables: string[];
  createdAt: string;
  updatedAt: string;
}

export default function AdminNotificationsPage() {
  const { toast } = useToast();
  
  // State for tabs
  const [activeTab, setActiveTab] = useState("notifications");
  
  // State for notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotificationsLoading, setIsNotificationsLoading] = useState(true);
  const [notificationsError, setNotificationsError] = useState<string | null>(null);
  
  // State for email templates
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [isTemplatesLoading, setIsTemplatesLoading] = useState(true);
  const [templatesError, setTemplatesError] = useState<string | null>(null);
  
  // State for notification form
  const [isNotificationDialogOpen, setIsNotificationDialogOpen] = useState(false);
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null);
  const [notificationFormData, setNotificationFormData] = useState({
    title: '',
    message: '',
    type: 'system',
    audience: 'all',
    status: 'draft',
    scheduledFor: ''
  });
  
  // State for template form
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [templateFormData, setTemplateFormData] = useState({
    name: '',
    subject: '',
    body: '',
    description: '',
    variables: [] as string[]
  });
  const [newVariable, setNewVariable] = useState('');
  
  // State for preview
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState<string>('');
  
  // State for saving
  const [isSaving, setIsSaving] = useState(false);
  
  // Fetch notifications and templates
  useEffect(() => {
    fetchNotifications();
    fetchEmailTemplates();
  }, []);
  
  const fetchNotifications = async () => {
    try {
      setIsNotificationsLoading(true);
      setNotificationsError(null);
      
      // This endpoint needs to be implemented in the backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/notifications`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }
      
      const data = await response.json();
      setNotifications(data.notifications);
    } catch (err: any) {
      console.error("Error fetching notifications:", err);
      setNotificationsError(err.message || "Failed to load notifications. Please try again later.");
    } finally {
      setIsNotificationsLoading(false);
    }
  };
  
  const fetchEmailTemplates = async () => {
    try {
      setIsTemplatesLoading(true);
      setTemplatesError(null);
      
      // This endpoint needs to be implemented in the backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/email-templates`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch email templates");
      }
      
      const data = await response.json();
      setEmailTemplates(data.templates);
    } catch (err: any) {
      console.error("Error fetching email templates:", err);
      setTemplatesError(err.message || "Failed to load email templates. Please try again later.");
    } finally {
      setIsTemplatesLoading(false);
    }
  };
  
  // Notification functions
  const handleAddNotification = () => {
    setEditingNotification(null);
    setNotificationFormData({
      title: '',
      message: '',
      type: 'system',
      audience: 'all',
      status: 'draft',
      scheduledFor: ''
    });
    setIsNotificationDialogOpen(true);
  };
  
  const handleEditNotification = (notification: Notification) => {
    setEditingNotification(notification);
    setNotificationFormData({
      title: notification.title,
      message: notification.message,
      type: notification.type,
      audience: notification.audience,
      status: notification.status,
      scheduledFor: notification.scheduledFor ? new Date(notification.scheduledFor).toISOString().slice(0, 16) : ''
    });
    setIsNotificationDialogOpen(true);
  };
  
  const handleDeleteNotification = async (notificationId: string) => {
    if (!confirm("Are you sure you want to delete this notification? This action cannot be undone.")) {
      return;
    }
    
    try {
      // This endpoint needs to be implemented in the backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/notifications/${notificationId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete notification");
      }
      
      // Remove notification from state
      setNotifications(prev => prev.filter(notification => notification._id !== notificationId));
      
      toast({
        title: "Notification deleted",
        description: "The notification has been deleted successfully."
      });
    } catch (err: any) {
      console.error("Error deleting notification:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to delete notification."
      });
    }
  };
  
  const handleSendNotification = async (notificationId: string) => {
    try {
      // This endpoint needs to be implemented in the backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/notifications/${notificationId}/send`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error("Failed to send notification");
      }
      
      // Update notification in state
      const data = await response.json();
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === notificationId ? data.notification : notification
        )
      );
      
      toast({
        title: "Notification sent",
        description: "The notification has been sent successfully."
      });
    } catch (err: any) {
      console.error("Error sending notification:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to send notification."
      });
    }
  };
  
  const handleNotificationFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      
      const isEditing = !!editingNotification;
      const url = isEditing 
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/notifications/${editingNotification._id}`
        : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/notifications`;
      
      const method = isEditing ? 'PUT' : 'POST';
      
      // This endpoint needs to be implemented in the backend
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationFormData),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${isEditing ? 'update' : 'create'} notification`);
      }
      
      const data = await response.json();
      
      if (isEditing) {
        // Update notification in state
        setNotifications(prev => 
          prev.map(notification => 
            notification._id === editingNotification._id ? data.notification : notification
          )
        );
        
        toast({
          title: "Notification updated",
          description: "The notification has been updated successfully."
        });
      } else {
        // Add new notification to state
        setNotifications(prev => [...prev, data.notification]);
        
        toast({
          title: "Notification created",
          description: "The notification has been created successfully."
        });
      }
      
      setIsNotificationDialogOpen(false);
    } catch (err: any) {
      console.error(`Error ${editingNotification ? 'updating' : 'creating'} notification:`, err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || `Failed to ${editingNotification ? 'update' : 'create'} notification.`
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Template functions
  const handleAddTemplate = () => {
    setEditingTemplate(null);
    setTemplateFormData({
      name: '',
      subject: '',
      body: '',
      description: '',
      variables: []
    });
    setNewVariable('');
    setIsTemplateDialogOpen(true);
  };
  
  const handleEditTemplate = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setTemplateFormData({
      name: template.name,
      subject: template.subject,
      body: template.body,
      description: template.description,
      variables: template.variables
    });
    setNewVariable('');
    setIsTemplateDialogOpen(true);
  };
  
  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm("Are you sure you want to delete this email template? This action cannot be undone.")) {
      return;
    }
    
    try {
      // This endpoint needs to be implemented in the backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/email-templates/${templateId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete email template");
      }
      
      // Remove template from state
      setEmailTemplates(prev => prev.filter(template => template._id !== templateId));
      
      toast({
        title: "Email template deleted",
        description: "The email template has been deleted successfully."
      });
    } catch (err: any) {
      console.error("Error deleting email template:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to delete email template."
      });
    }
  };
  
  const handleTemplateFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      
      const isEditing = !!editingTemplate;
      const url = isEditing 
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/email-templates/${editingTemplate._id}`
        : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/email-templates`;
      
      const method = isEditing ? 'PUT' : 'POST';
      
      // This endpoint needs to be implemented in the backend
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templateFormData),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${isEditing ? 'update' : 'create'} email template`);
      }
      
      const data = await response.json();
      
      if (isEditing) {
        // Update template in state
        setEmailTemplates(prev => 
          prev.map(template => 
            template._id === editingTemplate._id ? data.template : template
          )
        );
        
        toast({
          title: "Email template updated",
          description: "The email template has been updated successfully."
        });
      } else {
        // Add new template to state
        setEmailTemplates(prev => [...prev, data.template]);
        
        toast({
          title: "Email template created",
          description: "The email template has been created successfully."
        });
      }
      
      setIsTemplateDialogOpen(false);
    } catch (err: any) {
      console.error(`Error ${editingTemplate ? 'updating' : 'creating'} email template:`, err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || `Failed to ${editingTemplate ? 'update' : 'create'} email template.`
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleAddVariable = () => {
    if (!newVariable.trim()) return;
    
    if (!templateFormData.variables.includes(newVariable)) {
      setTemplateFormData({
        ...templateFormData,
        variables: [...templateFormData.variables, newVariable]
      });
    }
    
    setNewVariable('');
  };
  
  const handleRemoveVariable = (variable: string) => {
    setTemplateFormData({
      ...templateFormData,
      variables: templateFormData.variables.filter(v => v !== variable)
    });
  };
  
  const handleInsertVariable = (variable: string) => {
    const textarea = document.getElementById('templateBody') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    const newText = `${before}{{${variable}}}${after}`;
    
    setTemplateFormData({
      ...templateFormData,
      body: newText
    });
    
    // Focus back on textarea and set cursor position after the inserted variable
    setTimeout(() => {
      textarea.focus();
      const newPosition = start + variable.length + 4; // +4 for the {{ and }}
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };
  
  const handlePreviewTemplate = (template: EmailTemplate) => {
    // In a real implementation, you would render the template with sample data
    // For this example, we'll just show the template body with placeholders
    let previewHtml = template.body;
    
    // Replace variables with sample values
    template.variables.forEach(variable => {
      const sampleValue = `<span class="bg-yellow-100 px-1">[Sample ${variable}]</span>`;
      const regex = new RegExp(`{{${variable}}}`, 'g');
      previewHtml = previewHtml.replace(regex, sampleValue);
    });
    
    setPreviewContent(`
      <div class="p-4">
        <h2 class="text-xl font-bold mb-4">${template.subject}</h2>
        <div class="border p-4 rounded bg-white">
          ${previewHtml}
        </div>
      </div>
    `);
    
    setIsPreviewDialogOpen(true);
  };
  
  const getNotificationStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Draft</span>;
      case 'scheduled':
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Scheduled</span>;
      case 'sent':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Sent</span>;
      case 'failed':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Failed</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };
  
  const getNotificationTypeBadge = (type: string) => {
    switch (type) {
      case 'system':
        return <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">System</span>;
      case 'marketing':
        return <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800">Marketing</span>;
      case 'transactional':
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Transactional</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">{type}</span>;
    }
  };
  
  const getNotificationAudienceBadge = (audience: string) => {
    switch (audience) {
      case 'all':
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">All Users</span>;
      case 'merchants':
        return <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800">Merchants</span>;
      case 'clients':
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Clients</span>;
      case 'admins':
        return <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">Admins</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">{audience}</span>;
    }
  };
  
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Notifications & Email Templates</h1>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="email-templates">Email Templates</TabsTrigger>
          </TabsList>
          
          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6 mt-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Notification Management</h2>
              <Button onClick={handleAddNotification}>
                <Plus className="mr-2 h-4 w-4" />
                Create Notification
              </Button>
            </div>
            
            {isNotificationsLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              </div>
            ) : notificationsError ? (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <p className="text-sm text-red-700">{notificationsError}</p>
                </div>
              </div>
            ) : notifications.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Bell className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No Notifications</h3>
                  <p className="text-gray-500 mb-4 text-center max-w-md">
                    Create notifications to communicate with your users about important updates, promotions, or system changes.
                  </p>
                  <Button onClick={handleAddNotification}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Notification
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <Card key={notification._id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <h3 className="text-lg font-medium mr-2">{notification.title}</h3>
                            {getNotificationStatusBadge(notification.status)}
                          </div>
                          <p className="text-gray-500 mb-4">{notification.message}</p>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {getNotificationTypeBadge(notification.type)}
                            {getNotificationAudienceBadge(notification.audience)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {notification.status === 'scheduled' && notification.scheduledFor && (
                              <div className="mb-1">
                                Scheduled for: {new Date(notification.scheduledFor).toLocaleString()}
                              </div>
                            )}
                            {notification.status === 'sent' && notification.sentAt && (
                              <div className="mb-1">
                                Sent at: {new Date(notification.sentAt).toLocaleString()}
                              </div>
                            )}
                            <div>
                              Created: {new Date(notification.createdAt).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 mt-4 md:mt-0">
                          {notification.status === 'draft' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleSendNotification(notification._id)}
                            >
                              <Send className="h-4 w-4 mr-1" />
                              Send Now
                            </Button>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditNotification(notification)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteNotification(notification._id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          {/* Email Templates Tab */}
          <TabsContent value="email-templates" className="space-y-6 mt-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Email Template Management</h2>
              <Button onClick={handleAddTemplate}>
                <Plus className="mr-2 h-4 w-4" />
                Create Template
              </Button>
            </div>
            
            {isTemplatesLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              </div>
            ) : templatesError ? (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <p className="text-sm text-red-700">{templatesError}</p>
                </div>
              </div>
            ) : emailTemplates.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Mail className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No Email Templates</h3>
                  <p className="text-gray-500 mb-4 text-center max-w-md">
                    Create email templates to standardize your communications with users for various events and notifications.
                  </p>
                  <Button onClick={handleAddTemplate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Template
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {emailTemplates.map((template) => (
                  <Card key={template._id}>
                    <CardHeader>
                      <CardTitle>{template.name}</CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div>
                          <span className="font-medium">Subject:</span> {template.subject}
                        </div>
                        <div>
                          <span className="font-medium">Variables:</span>{' '}
                          {template.variables.length > 0 ? (
                            <span className="flex flex-wrap gap-1 mt-1">
                              {template.variables.map((variable) => (
                                <span key={variable} className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-800">
                                  {variable}
                                </span>
                              ))}
                            </span>
                          ) : (
                            <span className="text-gray-500">None</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          Last updated: {new Date(template.updatedAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2 mt-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handlePreviewTemplate(template)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Preview
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditTemplate(template)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteTemplate(template._id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Notification Form Dialog */}
      <Dialog open={isNotificationDialogOpen} onOpenChange={setIsNotificationDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingNotification ? 'Edit Notification' : 'Create Notification'}
            </DialogTitle>
            <DialogDescription>
              {editingNotification 
                ? 'Update the details of this notification.' 
                : 'Create a new notification to send to users.'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleNotificationFormSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Notification Title</Label>
                <Input
                  id="title"
                  value={notificationFormData.title}
                  onChange={(e) => setNotificationFormData({...notificationFormData, title: e.target.value})}
                  placeholder="e.g. New Feature Announcement"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={notificationFormData.message}
                  onChange={(e) => setNotificationFormData({...notificationFormData, message: e.target.value})}
                  placeholder="Enter the notification message..."
                  rows={4}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select 
                    value={notificationFormData.type} 
                    onValueChange={(value) => setNotificationFormData({...notificationFormData, type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="system">System</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="transactional">Transactional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="audience">Audience</Label>
                  <Select 
                    value={notificationFormData.audience} 
                    onValueChange={(value) => setNotificationFormData({...notificationFormData, audience: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="merchants">Merchants</SelectItem>
                      <SelectItem value="clients">Clients</SelectItem>
                      <SelectItem value="admins">Admins</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={notificationFormData.status} 
                  onValueChange={(value) => setNotificationFormData({...notificationFormData, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {notificationFormData.status === 'scheduled' && (
                <div className="space-y-2">
                  <Label htmlFor="scheduledFor">Schedule Date & Time</Label>
                  <Input
                    id="scheduledFor"
                    type="datetime-local"
                    value={notificationFormData.scheduledFor}
                    onChange={(e) => setNotificationFormData({...notificationFormData, scheduledFor: e.target.value})}
                    required={notificationFormData.status === 'scheduled'}
                  />
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsNotificationDialogOpen(false)}>
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
                    {editingNotification ? 'Update Notification' : 'Create Notification'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Email Template Form Dialog */}
      <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Edit Email Template' : 'Create Email Template'}
            </DialogTitle>
            <DialogDescription>
              {editingTemplate 
                ? 'Update the details of this email template.' 
                : 'Create a new email template for system communications.'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleTemplateFormSubmit}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Template Name</Label>
                  <Input
                    id="name"
                    value={templateFormData.name}
                    onChange={(e) => setTemplateFormData({...templateFormData, name: e.target.value})}
                    placeholder="e.g. Welcome Email"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subject">Email Subject</Label>
                  <Input
                    id="subject"
                    value={templateFormData.subject}
                    onChange={(e) => setTemplateFormData({...templateFormData, subject: e.target.value})}
                    placeholder="e.g. Welcome to Our Platform!"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={templateFormData.description}
                  onChange={(e) => setTemplateFormData({...templateFormData, description: e.target.value})}
                  placeholder="e.g. Sent to new users after registration"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="templateBody">Email Body</Label>
                  <div className="text-xs text-gray-500">
                    Supports HTML formatting
                  </div>
                </div>
                <Textarea
                  id="templateBody"
                  value={templateFormData.body}
                  onChange={(e) => setTemplateFormData({...templateFormData, body: e.target.value})}
                  placeholder="Enter the email body content..."
                  rows={12}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label>Template Variables</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {templateFormData.variables.map((variable) => (
                    <div key={variable} className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                      <span className="text-sm mr-1">{variable}</span>
                      <button
                        type="button"
                        className="text-gray-500 hover:text-gray-700"
                        onClick={() => handleRemoveVariable(variable)}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <Input
                    value={newVariable}
                    onChange={(e) => setNewVariable(e.target.value)}
                    placeholder="Add a variable (e.g. userName)"
                  />
                  <Button type="button" variant="outline" onClick={handleAddVariable}>
                    Add
                  </Button>
                </div>
              </div>
              
              {templateFormData.variables.length > 0 && (
                <div className="space-y-2">
                  <Label>Insert Variable</Label>
                  <div className="flex flex-wrap gap-2">
                    {templateFormData.variables.map((variable) => (
                      <Button
                        key={variable}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleInsertVariable(variable)}
                      >
                        {variable}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsTemplateDialogOpen(false)}>
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
                    {editingTemplate ? 'Update Template' : 'Create Template'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Template Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Email Template Preview</DialogTitle>
            <DialogDescription>
              This is how your email will look with sample data.
            </DialogDescription>
          </DialogHeader>
          
          <div className="border rounded-md overflow-hidden">
            <div dangerouslySetInnerHTML={{ __html: previewContent }} />
          </div>
          
          <DialogFooter>
            <Button onClick={() => setIsPreviewDialogOpen(false)}>
              Close Preview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}