import React, { useState } from 'react';
import { CheckCircle, X, FileText, MapPin, Phone, Mail, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Header from '@/components/Header';

const AdminVerifications = () => {
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [filter, setFilter] = useState('all');

  // Mock verification requests
  const verificationRequests = [
    {
      id: '60d0fe4f5311236168a10101',
      businessName: 'Savannah Electronics',
      ownerName: 'John Kimani',
      email: 'john@savannahelectronics.com',
      phone: '+254 712 345 678',
      category: 'Electronics',
      address: 'Moi Avenue, Building 12, Ground Floor',
      submittedDate: '2024-01-15',
      status: 'pending',
      documents: [
        { type: 'Business Registration', url: '#', verified: false },
        { type: 'ID Document', url: '#', verified: false },
        { type: 'Utility Bill', url: '#', verified: false }
      ]
    },
    {
      id: '60d0fe4f5311236168a10102',
      businessName: 'Nairobi Tech Solutions',
      ownerName: 'Mary Wanjiku',
      email: 'mary@nairobitecsolutions.com',
      phone: '+254 723 456 789',
      category: 'Technology Services',
      address: 'Kimathi Street, 4th Floor, Room 403',
      submittedDate: '2024-01-14',
      status: 'pending',
      documents: [
        { type: 'Business Registration', url: '#', verified: false },
        { type: 'ID Document', url: '#', verified: false },
        { type: 'Utility Bill', url: '#', verified: false }
      ]
    },
    {
      id: '60d0fe4f5311236168a10103',
      businessName: 'CBD Fashion House',
      ownerName: 'Peter Ochieng',
      email: 'peter@cbdfashion.com',
      phone: '+254 734 567 890',
      category: 'Fashion & Clothing',
      address: 'Tom Mboya Street, Shop 15',
      submittedDate: '2024-01-13',
      status: 'approved',
      documents: [
        { type: 'Business Registration', url: '#', verified: true },
        { type: 'ID Document', url: '#', verified: true },
        { type: 'Utility Bill', url: '#', verified: true }
      ]
    }
  ];

  const filteredRequests = verificationRequests.filter(request => 
    filter === 'all' || request.status === filter
  );

  const handleApprove = (merchantId) => {
    console.log('Approving merchant:', merchantId);
    // In real app, this would make API call
  };

  const handleReject = (merchantId) => {
    console.log('Rejecting merchant:', merchantId);
    // In real app, this would make API call
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Merchant Verifications</h1>
          <p className="text-gray-600 mt-2">Review and process merchant verification requests</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Verification Queue */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Verification Queue</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant={filter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('all')}
                  >
                    All
                  </Button>
                  <Button
                    variant={filter === 'pending' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('pending')}
                  >
                    Pending
                  </Button>
                  <Button
                    variant={filter === 'approved' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('approved')}
                  >
                    Approved
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-2">
                  {filteredRequests.map((request) => (
                    <div
                      key={request.id}
                      className={`p-4 cursor-pointer border-b hover:bg-gray-50 ${
                        selectedMerchant?.id === request.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                      }`}
                      onClick={() => setSelectedMerchant(request)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{request.businessName}</h4>
                          <p className="text-sm text-gray-500">{request.ownerName}</p>
                          <p className="text-xs text-gray-400">{request.submittedDate}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          request.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : request.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {request.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Verification Details */}
          <div className="lg:col-span-2">
            {selectedMerchant ? (
              <div className="space-y-6">
                {/* Merchant Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{selectedMerchant.businessName}</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        selectedMerchant.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : selectedMerchant.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedMerchant.status}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <p className="font-medium">{selectedMerchant.phone}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium">{selectedMerchant.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Address</p>
                          <p className="font-medium">{selectedMerchant.address}</p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Category</p>
                        <p className="font-medium">{selectedMerchant.category}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Documents Review */}
                <Card>
                  <CardHeader>
                    <CardTitle>Verification Documents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedMerchant.documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="font-medium">{doc.type}</p>
                              <p className="text-sm text-gray-500">PDF Document</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              doc.verified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {doc.verified ? 'Verified' : 'Pending'}
                            </span>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Verification Actions */}
                {selectedMerchant.status === 'pending' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Verification Decision</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Admin Notes (Optional)
                          </label>
                          <textarea
                            className="w-full p-3 border border-gray-300 rounded-md"
                            rows={3}
                            placeholder="Add any notes about this verification..."
                          />
                        </div>
                        
                        <div className="flex gap-4">
                          <Button
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            onClick={() => handleApprove(selectedMerchant.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve Merchant
                          </Button>
                          
                          <Button
                            variant="outline"
                            className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                            onClick={() => handleReject(selectedMerchant.id)}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Reject Application
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card className="h-96 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Select a merchant from the queue to review their verification request</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminVerifications;
