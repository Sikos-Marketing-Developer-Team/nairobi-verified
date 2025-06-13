import React, { useState } from 'react';
import { Search, Filter, Edit, Eye, Plus, CheckCircle, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Header from '@/components/Header';
import { Link } from 'react-router-dom';

const AdminMerchants = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock merchants data
  const merchants = [
    {
      id: '60d0fe4f5311236168a10101',
      name: 'TechHub Kenya',
      owner: 'John Kimani',
      category: 'Electronics',
      location: 'Kimathi Street',
      status: 'verified',
      joinDate: '2024-01-10',
      email: 'john@techhub.com',
      phone: '+254 712 345 678'
    },
    {
      id: '60d0fe4f5311236168a10102',
      name: 'CBD Fashion House',
      owner: 'Mary Wanjiku',
      category: 'Fashion',
      location: 'Tom Mboya Street',
      status: 'verified',
      joinDate: '2024-01-08',
      email: 'mary@cbdfashion.com',
      phone: '+254 723 456 789'
    },
    {
      id: '60d0fe4f5311236168a10103',
      name: 'Savannah Electronics',
      owner: 'Peter Ochieng',
      category: 'Electronics',
      location: 'Moi Avenue',
      status: 'pending',
      joinDate: '2024-01-15',
      email: 'peter@savannah.com',
      phone: '+254 734 567 890'
    },
    {
      id: '60d0fe4f5311236168a10104',
      name: 'Nairobi Pharmacy',
      owner: 'Grace Muthoni',
      category: 'Healthcare',
      location: 'Kenyatta Avenue',
      status: 'verified',
      joinDate: '2024-01-05',
      email: 'grace@pharmacy.com',
      phone: '+254 745 678 901'
    }
  ];

  const filteredMerchants = merchants.filter(merchant => {
    const matchesSearch = merchant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         merchant.owner.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || merchant.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manage Merchants</h1>
              <p className="text-gray-600 mt-2">View and manage all merchants on the platform</p>
            </div>
            <Link to="/admin/merchants/add">
              <Button className="bg-primary hover:bg-primary-dark">
                <Plus className="h-4 w-4 mr-2" />
                Add Merchant
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="Search merchants by name or owner..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('all')}
                >
                  All ({merchants.length})
                </Button>
                <Button
                  variant={statusFilter === 'verified' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('verified')}
                >
                  Verified ({merchants.filter(m => m.status === 'verified').length})
                </Button>
                <Button
                  variant={statusFilter === 'pending' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('pending')}
                >
                  Pending ({merchants.filter(m => m.status === 'pending').length})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Merchants Table */}
        <Card>
          <CardHeader>
            <CardTitle>Merchants Directory</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4 font-medium text-gray-900">Business</th>
                    <th className="text-left p-4 font-medium text-gray-900">Owner</th>
                    <th className="text-left p-4 font-medium text-gray-900">Category</th>
                    <th className="text-left p-4 font-medium text-gray-900">Location</th>
                    <th className="text-left p-4 font-medium text-gray-900">Status</th>
                    <th className="text-left p-4 font-medium text-gray-900">Join Date</th>
                    <th className="text-left p-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMerchants.map((merchant) => (
                    <tr key={merchant.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-gray-900">{merchant.name}</p>
                          <p className="text-sm text-gray-500">{merchant.email}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-gray-900">{merchant.owner}</p>
                          <p className="text-sm text-gray-500">{merchant.phone}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {merchant.category}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600">{merchant.location}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          merchant.status === 'verified'
                            ? 'bg-green-100 text-green-800'
                            : merchant.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {merchant.status === 'verified' && <CheckCircle className="inline h-3 w-3 mr-1" />}
                          {merchant.status}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600">{merchant.joinDate}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Link to={`/merchant/${merchant.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredMerchants.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No merchants found matching your criteria</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminMerchants;
